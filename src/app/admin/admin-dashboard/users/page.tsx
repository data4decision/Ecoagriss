import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import UsersClient from '@/components/UsersClient';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  occupation: string;
  country: string;
  createdAt: Date;
  status: 'active' | 'blocked';
  role: string;
  lastActive?: Date;
}

interface ProfileRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  occupation: string;
  country: string;
  created_at: string;
  status: string;
  last_active: string | null;
}

export default async function UsersPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();

    /*
     * Verify that the current authenticated user is an
     * administrator before accessing all user profiles.
     */
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return (
        <UsersClient
          initialUsers={[]}
          error="You must be logged in to access users."
        />
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        'Supabase server configuration is incomplete.'
      );

      return (
        <UsersClient
          initialUsers={[]}
          error="Server configuration is incomplete."
        />
      );
    }

    /*
     * Use the server-side service role only after the
     * authenticated user has been identified.
     */
    const supabaseAdmin = createSupabaseAdmin(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * Verify that the authenticated account exists in
     * the separate admin_profiles table.
     */
    const { data: adminProfile, error: adminError } =
      await supabaseAdmin
        .from('admin_profiles')
        .select('id, role, status')
        .eq('id', currentUser.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        'Failed to verify administrator:',
        adminError
      );

      return (
        <UsersClient
          initialUsers={[]}
          error="Unable to verify administrator access."
        />
      );
    }

    if (
      !adminProfile ||
      adminProfile.status !== 'active'
    ) {
      return (
        <UsersClient
          initialUsers={[]}
          error="Administrator access is denied."
        />
      );
    }

    /*
     * Fetch registered users from Supabase.
     */
    const { data: profiles, error: profilesError } =
      await supabaseAdmin
        .from('profiles')
        .select(
          `
            id,
            first_name,
            last_name,
            email,
            phone_number,
            gender,
            occupation,
            country,
            created_at,
            status,
            last_active
          `
        )
        .order('created_at', {
          ascending: false,
        });

    if (profilesError) {
      throw profilesError;
    }

    const records = (profiles ?? []) as ProfileRecord[];

    users = records.map((profile) => ({
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone_number || '',
      gender: profile.gender || '',
      occupation: profile.occupation || '',
      country: profile.country || 'Nigeria',
      createdAt: new Date(profile.created_at),
      status:
        profile.status === 'blocked'
          ? 'blocked'
          : 'active',
      role: 'User',
      lastActive: profile.last_active
        ? new Date(profile.last_active)
        : new Date(profile.created_at),
    }));
  } catch (err: unknown) {
    console.error('Failed to fetch users:', err);

    error =
      'Failed to load users. Please try again later.';
  }

  return (
    <UsersClient
      initialUsers={users}
      error={error}
    />
  );
}