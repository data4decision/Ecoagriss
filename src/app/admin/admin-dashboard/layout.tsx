
'use client';

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import AdminSidebar from './AdminSidebar';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaCaretDown,
  FaCog,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface AdminUser {
  first_name: string;
  email: string;
  role: string;
  status: string;
}

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSideBarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [user, setUser] =
    useState<AdminUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const router = useRouter();

  /*
   * Fetch and verify administrator profile.
   */
  const fetchAdminData = async (
    uid: string
  ): Promise<boolean> => {
    try {
      const supabase = createClient();

      const {
        data: adminProfile,
        error,
      } = await supabase
        .from('admin_profiles')
        .select(
          'first_name, email, role, status'
        )
        .eq('id', uid)
        .single();

      if (
        error ||
        !adminProfile ||
        adminProfile.status !== 'active'
      ) {
        console.log(
          'Active admin profile not found'
        );

        setUser(null);

        return false;
      }

      setUser(adminProfile);

      return true;
    } catch (error: unknown) {
      console.error(
        'Error fetching admin data:',
        error
      );

      setUser(null);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Check the current Supabase session.
   */
  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            'Session error:',
            sessionError
          );

          setUser(null);
          setIsLoading(false);

          router.replace('/admin/login');

          return;
        }

        if (!session?.user) {
          setUser(null);
          setIsLoading(false);

          router.replace('/admin/login');

          return;
        }

        const isAdmin = await fetchAdminData(
          session.user.id
        );

        if (!isAdmin) {
          await supabase.auth.signOut();

          setUser(null);
          setIsLoading(false);

          router.replace('/admin/login');
        }
      } catch (error: unknown) {
        console.error(
          'Session verification failed:',
          error
        );

        await supabase.auth.signOut();

        setUser(null);
        setIsLoading(false);

        router.replace('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  /*
   * Detect mobile screen size.
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile =
        window.innerWidth < 1024;

      setIsMobile(mobile);
      setIsSidebarCollapsed(mobile);
    };

    handleResize();

    window.addEventListener(
      'resize',
      handleResize
    );

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  /*
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  /*
   * Logout administrator.
   */
  const handleLogout = async () => {
    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          'Logout failed:',
          error
        );

        return;
      }

      setUser(null);
      setIsDropdownOpen(false);

      router.replace('/admin/login');
    } catch (error: unknown) {
      console.error(
        'Logout failed:',
        error
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        onCollapseChange={
          setIsSidebarCollapsed
        }
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 overflow-x-hidden ${
          isSideBarCollapsed
            ? 'lg:ml-13'
            : 'lg:ml-44'
        } min-w-0`}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--yellow)] bg-[var(--medium-green)] text-white shadow-sm">
          <h1 className="text-lg font-semibold">
            {isLoading
              ? 'Loading...'
              : user?.first_name || 'Admin'}
          </h1>

          <LanguageSwitcher />

          <div
            className="relative"
            ref={dropdownRef}
          >
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-[var(--wine)]/90 p-2 rounded-md transition-colors"
              onClick={() =>
                setIsDropdownOpen(
                  (previous) => !previous
                )
              }
              aria-label="Admin Profile"
              aria-expanded={isDropdownOpen}
            >
              <div className="h-8 w-8 rounded-full bg-white overflow-hidden border-2 border-white">
                <Image
                  src="/user.png"
                  width={32}
                  height={32}
                  alt="Admin avatar"
                  className="object-cover"
                />
              </div>

              {!isMobile && (
                <span className="text-sm font-medium">
                  {isLoading
                    ? 'Loading...'
                    : user?.first_name ||
                      'Admin'}
                </span>
              )}

              <FaCaretDown
                className={`transition-transform ${
                  isDropdownOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-[var(--medium-green)] rounded-md shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-semibold text-sm">
                    {isLoading
                      ? 'Loading...'
                      : user?.first_name ||
                        'Admin'}
                  </p>

                  <p className="text-xs text-[var(--green)] truncate">
                    {isLoading
                      ? 'Loading...'
                      : user?.email ||
                        'Admin'}
                  </p>
                </div>

                <ul className="py-1">
                  <li>
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/10 text-sm"
                      onClick={() =>
                        setIsDropdownOpen(
                          false
                        )
                      }
                    >
                      <FaUser />
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/admin/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/10 text-sm"
                      onClick={() =>
                        setIsDropdownOpen(
                          false
                        )
                      }
                    >
                      <FaCog />
                      Settings
                    </Link>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/10 text-left text-sm text-red-600"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 ml-10 lg:ml-0 bg-slate-50 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--medium-green)]"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
