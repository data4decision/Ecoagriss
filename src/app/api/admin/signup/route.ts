import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AdminSignupRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  signupKey?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminSignupRequest;

    const {
      firstName,
      lastName,
      email,
      password,
      signupKey,
    } = body;

    const expectedSignupKey =
      process.env.ECOAGRIS_ADMIN_SIGNUP_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !expectedSignupKey ||
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        'Admin signup server configuration is incomplete.'
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Admin signup is not properly configured.',
        },
        { status: 500 }
      );
    }

    if (!signupKey || signupKey !== expectedSignupKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin signup key.',
        },
        { status: 403 }
      );
    }

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'All required fields must be provided.',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters.',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createClient(
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
     * Check whether an administrator profile already
     * exists with this email.
     */
    const { data: existingAdmin, error: existingAdminError } =
      await supabase
        .from('admin_profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existingAdminError) {
      console.error(
        'Admin profile lookup error:',
        existingAdminError
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify administrator account.',
        },
        { status: 500 }
      );
    }

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'An administrator account already exists with this email.',
        },
        { status: 409 }
      );
    }

    /*
     * Create the Supabase Auth account.
     *
     * account_type=admin prevents the normal user
     * profile trigger from creating a profiles row.
     */
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          account_type: 'admin',
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      });

    if (authError || !authData.user) {
      console.error('Admin Auth creation error:', authError);

      return NextResponse.json(
        {
          success: false,
          error:
            authError?.message ||
            'Unable to create administrator account.',
        },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    /*
     * Create the separate admin profile.
     */
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: normalizedEmail,
        role: 'admin',
        status: 'active',
      });

    if (profileError) {
      console.error(
        'Admin profile creation error:',
        profileError
      );

      /*
       * Clean up the Auth account if the admin profile
       * cannot be created.
       */
      const { error: deleteError } =
        await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error(
          'Admin Auth cleanup error:',
          deleteError
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'Administrator account could not be completed.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Administrator account created successfully.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Admin signup error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred.',
      },
      { status: 500 }
    );
  }
}