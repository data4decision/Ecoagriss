'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { FaCaretDown, FaCog, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'next-i18next';

interface User {
  first_name?: string;
  email?: string;
}

const LivestockLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation('common'); // Only common.json
  const [isSideBarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

 const fetchUserData = async () => {
  try {
    const supabase = createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setUser({
        email: currentUser.email,
      });
      return;
    }

    setUser(profile);
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchUserData();
}, []);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarCollapsed(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 const handleLogout = async () => {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error);
      return;
    }

    router.push('/login');
  } catch (error: unknown) {
    console.error('Error logging out:', error);
  }
};

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSideBarCollapsed ? 'lg:ml-13' : 'lg:ml-44'} text-[var(--white)] min-w-0`}>
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--yellow)] bg-[var(--medium-green)] text-[var(--white)] shadow-sm w-full">
          <h1 className="text-lg font-semibold sm:ml-0 ml-10">
            {isLoading ? t('layout.loading') : user?.first_name ? t('layout.greeting', { name: user.first_name }) : t('layout.user')}
          </h1>

          <LanguageSwitcher />

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 hover:bg-[var(--wine)]/90 p-2 rounded-md transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label={t('layout.profile')}
            >
              <div className="h-8 w-8 rounded-full bg-[var(--white)] overflow-hidden">
                <Image src="/user.png" width={32} height={32} alt={t('layout.user')} />
              </div>
              {!isMobile && (
                <span className="text-sm font-medium">
                  {isLoading ? t('layout.loading') : user?.first_name || t('layout.username')}
                </span>
              )}
              <FaCaretDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--white)] text-[var(--medium-green)] rounded-md shadow-lg z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-semibold">{isLoading ? t('layout.loading') : user?.first_name || t('layout.user')}</p>
                  <p className="text-sm text-[var(--green)]">{isLoading ? t('layout.loading') : user?.email || t('layout.noEmail')}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/90 text-[var(--medium-green)]">
                      <FaUser />
                      {t('layout.profile')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/90 text-[var(--medium-green)]">
                      <FaCog />
                      {t('layout.settings')}
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--wine)]/90 text-left text-[var(--medium-green)]">
                      <FaSignOutAlt />
                      {t('layout.logout')}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 ml-10 sm:ml-0 p-6 w-full bg-[var(--light-gray)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LivestockLayout;