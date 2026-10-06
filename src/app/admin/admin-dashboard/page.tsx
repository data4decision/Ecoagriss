import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { format } from 'date-fns';

import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

interface UploadRecord {
  uploaded_at: string;
  created_at: string;
  title: string;
}

interface DashboardStats {
  totalUsers: number;
  activeAdmins: number;
  totalUploads: number;
  totalDatasets: number;
  pendingUploads: number;
  totalProducts: number;
  recentLogs: number;
  lastUpload: string;
}

export default async function DashboardHome() {
  let stats: DashboardStats | null = null;   // ← fixed type
  let error: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase server configuration is incomplete.');
    }

    const supabase = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const [
      usersResult,
      adminsResult,
      uploadsResult,
      datasetsResult,
      agriculturalResult,
      livestockResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('admin_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),

      supabase
        .from('uploads')
        .select('id, title, uploaded_at, created_at')
        .order('uploaded_at', { ascending: false }),

      supabase
        .from('datasets')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('agricultural_inputs')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('livestock_data')
        .select('id', { count: 'exact', head: true }),
    ]);

    if (usersResult.error) {
      console.error('Dashboard profiles query failed:', usersResult.error);
      throw new Error(
        `Profiles query failed: ${usersResult.error.message || JSON.stringify(usersResult.error)}`
      );
    }

    if (adminsResult.error) {
      console.error('Dashboard admin_profiles query failed:', adminsResult.error);
      throw new Error(
        `Admin profiles query failed: ${adminsResult.error.message || JSON.stringify(adminsResult.error)}`
      );
    }

    if (uploadsResult.error) {
      console.error('Dashboard uploads query failed:', uploadsResult.error);
      throw new Error(
        `Uploads query failed: ${uploadsResult.error.message || JSON.stringify(uploadsResult.error)}`
      );
    }

    if (datasetsResult.error) {
      console.error('Dashboard datasets query failed:', datasetsResult.error);
      throw new Error(
        `Datasets query failed: ${datasetsResult.error.message || JSON.stringify(datasetsResult.error)}`
      );
    }

    if (agriculturalResult.error) {
      console.error('Dashboard agricultural_inputs query failed:', agriculturalResult.error);
      throw new Error(
        `Agricultural inputs query failed: ${agriculturalResult.error.message || JSON.stringify(agriculturalResult.error)}`
      );
    }

    if (livestockResult.error) {
      console.error('Dashboard livestock_data query failed:', livestockResult.error);
      throw new Error(
        `Livestock data query failed: ${livestockResult.error.message || JSON.stringify(livestockResult.error)}`
      );
    }

    const uploads = (uploadsResult.data ?? []) as UploadRecord[];
    const latestUpload = uploads[0];

    const totalProducts =
      (agriculturalResult.count ?? 0) + (livestockResult.count ?? 0);

    stats = {
      totalUsers: usersResult.count ?? 0,
      activeAdmins: adminsResult.count ?? 0,
      totalUploads: uploads.length,
      totalDatasets: datasetsResult.count ?? 0,
      pendingUploads: 0,
      totalProducts,
      recentLogs: 0,
      lastUpload: latestUpload
        ? format(
            new Date(latestUpload.uploaded_at || latestUpload.created_at),
            'PPP p'
          )
        : 'No uploads yet',
    };
  } catch (err: unknown) {
  console.error(
    '========== DASHBOARD ERROR =========='
  );

  if (err instanceof Error) {
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.error(
      'Unknown error:',
      JSON.stringify(err, null, 2)
    );
  }

  console.error(
    '====================================='
  );

  error =
    'Failed to load dashboard data. Please try again later.';
}

  return <DashboardClient stats={stats} error={error} />;
}