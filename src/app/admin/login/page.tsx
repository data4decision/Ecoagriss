'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const isNavigating = useRef(false);

  const supabase = createClient();

  /*
   * Check whether an existing authenticated session
   * belongs to an active administrator.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            'Session check error:',
            sessionError
          );

          return;
        }

        if (!session?.user || isNavigating.current) {
          return;
        }

        const {
          data: adminProfile,
          error: profileError,
        } = await supabase
          .from('admin_profiles')
          .select(
            'id, first_name, last_name, email, role, status'
          )
          .eq('id', session.user.id)
          .single();

        if (profileError || !adminProfile) {
          console.error(
            'Existing session is not an administrator:',
            profileError
          );

          await supabase.auth.signOut();

          return;
        }

        if (adminProfile.status !== 'active') {
          await supabase.auth.signOut();

          return;
        }

        if (
          adminProfile.role !== 'admin' &&
          adminProfile.role !== 'super_admin'
        ) {
          await supabase.auth.signOut();

          return;
        }

        isNavigating.current = true;

        router.replace('/admin/admin-dashboard');
      } catch (error: unknown) {
        console.error(
          'Authentication check failed:',
          error
        );
      }
    };

    checkSession();
  }, [router, supabase]);

  /*
   * Handle administrator login.
   */
  const handleEmailLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const {
        data,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error(
          'Admin login auth error:',
          authError
        );

        if (
          authError.message
            .toLowerCase()
            .includes('email not confirmed')
        ) {
          setError(
            'Please confirm your email address before logging in.'
          );
        } else {
          setError(
            'Invalid administrator credentials.'
          );
        }

        return;
      }

      const user = data.user;

      if (!user) {
        setError(
          'Unable to authenticate administrator.'
        );

        return;
      }

      console.log(
        'Admin Auth login successful.'
      );

      console.log(
        'Admin User ID:',
        user.id
      );

      /*
       * Verify the authenticated user against
       * the admin_profiles table.
       */
      const {
        data: adminProfile,
        error: profileError,
      } = await supabase
        .from('admin_profiles')
        .select(
          'id, first_name, last_name, email, role, status'
        )
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error(
          'Admin profile lookup error:',
          profileError
        );

        await supabase.auth.signOut();

        setError(
          'Unable to verify administrator account.'
        );

        return;
      }

      if (!adminProfile) {
        await supabase.auth.signOut();

        setError(
          'Administrator profile was not found.'
        );

        return;
      }

      if (adminProfile.status !== 'active') {
        await supabase.auth.signOut();

        setError(
          'This administrator account is not active.'
        );

        return;
      }

      if (
        adminProfile.role !== 'admin' &&
        adminProfile.role !== 'super_admin'
      ) {
        await supabase.auth.signOut();

        setError(
          'This account does not have administrator privileges.'
        );

        return;
      }

      console.log(
        'Admin profile verified.'
      );

      console.log(
        'Admin:',
        adminProfile.first_name
      );

      isNavigating.current = true;

      router.replace('/admin/admin-dashboard');
    } catch (error: unknown) {
      console.error(
        'Admin login error:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to log in as administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--yellow)] to-[var(--dark-green)] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[var(--yellow)] p-3 rounded-full">
            <div className="bg-white p-2 rounded-full">
              <span className="text-2xl font-bold text-[var(--dark-green)]">
                ECOAGRIS
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--dark-green)] mb-2">
          Admin
        </h1>

        <p className="text-sm font-bold text-center text-[var(--olive-green)] mb-6">
          Access the ECOAGRIS Admin Dashboard
        </p>

        <form
          onSubmit={handleEmailLogin}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@gmail.com"
              className="w-full px-4 py-3 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
                required
                disabled={loading}
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dark-green)] hover:text-[var(--olive-green)] focus:outline-none"
                disabled={loading}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--dark-green)] hover:bg-[var(--olive-green)] cursor-pointer text-[var(--white)] py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin h-5 w-5" />
                Signing In...
              </span>
            ) : (
              'Login'
            )}
          </button>

          {error && (
            <p className="text-[var(--red)] text-sm text-center mt-3 bg-red-50 py-2 px-4 rounded-md">
              {error}
            </p>
          )}
        </form>

        <p className="text-xs text-[var(--wine)] text-center mt-6">
          Only{' '}
          <span className="font-medium">
            administrators
          </span>{' '}
          can access this panel.
        </p>
      </div>
    </div>
  );
}