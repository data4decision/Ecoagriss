'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  FaBell,
  FaChartBar,
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaCog,
  FaFile,
  FaQuestionCircle,
  FaUpload,
  FaUsers,
} from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';

import { createClient } from '@/lib/supabase/client';

interface AdminSidebarProps {
  onCollapseChange: (collapsed: boolean) => void;
}

const AdminSidebar = ({
  onCollapseChange,
}: AdminSidebarProps) => {
  const { t } = useTranslation('common');
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const topNav = [
    {
      label: t('adminSidebar.nav.dashboard'),
      href: '/admin/admin-dashboard',
      icon: FaChartBar,
    },
    {
      label: t('adminSidebar.nav.allSectorsWatch'),
      href: '/admin/dashboard/all-sectors-watch',
      icon: FiGlobe,
    },
    {
      label: t('adminSidebar.nav.users'),
      href: '/admin/admin-dashboard/users',
      icon: FaUsers,
    },
    {
      label: t('adminSidebar.nav.upload'),
      href: '/admin/admin-dashboard/data-upload',
      icon: FaUpload,
    },
    {
      label: t('adminSidebar.nav.files'),
      href: '/admin/admin-dashboard/files',
      icon: FaFile,
    },
    {
      label: t('adminSidebar.nav.settings'),
      href: '/admin/admin-dashboard/settings',
      icon: FaCog,
    },
    {
      label: t('adminSidebar.nav.help'),
      href: '/admin/admin-dashboard/help-support',
      icon: FaQuestionCircle,
    },
  ];

  const bottomNav = [
    {
      label: t('adminSidebar.nav.notifications'),
      href: '/admin/admin-dashboard/notifications',
      icon: FaBell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin/admin-dashboard') {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('admin_notifications')
          .select('id', { count: 'exact', head: true })
          .eq('read', false);

        if (error) {
          console.error('Failed to fetch unread count:', error);
          return;
        }

        setUnreadCount(count ?? 0);
      } catch (error: unknown) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    void fetchUnreadCount();

    const channel = supabase
      .channel('admin-notifications-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
        },
        () => {
          void fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      const collapsed = mobile;

      setIsCollapsed(collapsed);
      onCollapseChange(collapsed);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [onCollapseChange]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      onCollapseChange(next);
      return next;
    });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-[var(--dark-green)] text-[var(--white)] transition-all duration-300 ${
        isCollapsed ? 'w-13' : 'w-44'
      }`}
      aria-label={t('adminSidebar.ariaLabel')}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-[var(--wine)] px-4 font-semibold">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--white)] font-bold">
          <Image
            src="/logo.png"
            width={30}
            height={30}
            alt={t('adminSidebar.logoAlt')}
          />
        </div>

        {!isCollapsed && <span>{t('adminSidebar.brand')}</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {topNav.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`relative flex items-center gap-3 px-4 py-3 text-sm transition-colors sm:text-[15px] ${
                  isActive(href)
                    ? 'bg-[var(--dark-green)] font-semibold text-[var(--white)] shadow'
                    : 'hover:bg-[var(--yellow)]/90'
                }`}
              >
                <Icon className="shrink-0 text-[var(--white)]" />

                {!isCollapsed && (
                  <span className="text-sm sm:text-[12px]">
                    {label}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {bottomNav.map(({ href, icon: Icon, label, badge }) => (
            <li key={href}>
              <Link
                href={href}
                className={`relative flex items-center gap-3 px-4 py-3 text-sm transition-colors sm:text-[15px] ${
                  isActive(href)
                    ? 'bg-[var(--dark-green)] font-semibold text-[var(--white)] shadow'
                    : 'hover:bg-[var(--yellow)]/90'
                }`}
              >
                <div className="relative">
                  <Icon className="shrink-0 text-white" />

                  {badge !== null && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--red)] text-[10px] font-bold text-white shadow">
                      {badge}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <span className="text-sm sm:text-[12px]">
                    {label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        className={`absolute top-21 ${
          isCollapsed ? 'left-17' : 'left-47'
        } -translate-x-full rounded-full bg-[var(--wine)] p-2 text-[var(--white)]`}
        onClick={toggleCollapse}
        aria-label={
          isCollapsed
            ? t('adminSidebar.expand')
            : t('adminSidebar.collapse')
        }
      >
        {isCollapsed ? (
          <FaChevronCircleRight />
        ) : (
          <FaChevronCircleLeft />
        )}
      </button>
    </aside>
  );
};

export default AdminSidebar;