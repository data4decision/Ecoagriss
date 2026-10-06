'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

export default function AdminSignup() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupKey, setSignupKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!signupKey.trim()) {
      setError('Admin signup key is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          signupKey,
        }),
      });

      const result: {
        success?: boolean;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            'Unable to create the administrator account.'
        );
        return;
      }

      setSuccess(
        'Admin account created successfully. Redirecting to login...'
      );

      setTimeout(() => {
        router.push('/admin/login');
      }, 1500);
    } catch (error: unknown) {
      console.error('Admin signup error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create admin account.'
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
          Admin Sign Up
        </h1>

        <p className="text-sm text-center text-[var(--olive-green)] mb-6">
          Create an ECOAGRIS administrator account
        </p>

        <form onSubmit={handleSignup} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
                First Name
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-3 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
                required
                disabled={loading}
                autoComplete="given-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
                Last Name
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-4 py-3 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
                required
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecoagris.org"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 pr-12 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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

          <div>
            <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm password"
                className="w-full px-4 py-3 pr-12 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dark-green)] hover:text-[var(--olive-green)] focus:outline-none"
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--dark-green)] mb-1">
              Admin Signup Key
            </label>

            <input
              type="password"
              value={signupKey}
              onChange={(e) => setSignupKey(e.target.value)}
              placeholder="Enter admin signup key"
              className="w-full px-4 py-3 border border-[var(--wine)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yellow)] focus:border-transparent transition"
              required
              disabled={loading}
              autoComplete="off"
            />

            <p className="text-xs text-[var(--wine)] mt-1">
              This key is required to create an administrator account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--dark-green)] hover:bg-[var(--olive-green)] cursor-pointer text-[var(--white)] py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin h-5 w-5" />
                Creating Account...
              </span>
            ) : (
              'Create Admin Account'
            )}
          </button>

          {error && (
            <p className="text-[var(--red)] text-sm text-center mt-3 bg-red-50 py-2 px-4 rounded-md">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-700 text-sm text-center mt-3 bg-green-50 py-2 px-4 rounded-md">
              {success}
            </p>
          )}
        </form>

        <p className="text-xs text-[var(--wine)] text-center mt-6">
          Administrator access is restricted to authorized personnel.
        </p>

        <button
          type="button"
          onClick={() => router.push('/admin/login')}
          className="w-full mt-3 text-sm text-[var(--dark-green)] hover:text-[var(--olive-green)] font-medium transition"
        >
          Already have an admin account? Login
        </button>

      </div>
    </div>
  );
}