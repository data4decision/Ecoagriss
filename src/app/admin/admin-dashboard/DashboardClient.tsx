'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  FaUsers,
  FaUpload,
  FaDatabase,
  FaFileAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { FiGlobe, FiArrowRight } from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  activeAdmins: number;
  totalUploads: number;
  totalDatasets: number;
  pendingUploads: number;
  totalProducts: number;
  recentLogs: number;
  lastUpload: string;
}

interface DashboardNavigation {
  allSectorsWatch: {
    title: string;
    description: string;
    href: string;
  };
}

interface DashboardClientProps {
  stats: Stats | null;
  error: string | null;
  navigation: DashboardNavigation;
}

export default function DashboardClient({
  stats,
  error,
  navigation,
}: DashboardClientProps) {
  const { t } = useTranslation('common');

  if (error || !stats) {
    return (
      <ErrorState
        message={error || t('dashboard.noData')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--olive-green)] md:text-3xl">
          {t('dashboard.title')}
        </h1>

        <p className="mt-1 text-sm text-[var(--olive-green)]/70">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FaUsers />}
          label={t('dashboard.stats.users')}
          value={stats.totalUsers.toLocaleString()}
          color="bg-[var(--medium-green)]"
        />

        <StatCard
          icon={<FaUpload />}
          label={t('dashboard.stats.uploads')}
          value={stats.totalUploads.toString()}
          badge={
            stats.pendingUploads > 0
              ? `${stats.pendingUploads} pending`
              : undefined
          }
          color="bg-[var(--wine)]"
        />

        <StatCard
          icon={<FaDatabase />}
          label={t('dashboard.stats.products')}
          value={stats.totalProducts.toString()}
          color="bg-[var(--dark-green)]"
        />

        <StatCard
          icon={<FaFileAlt />}
          label={t('dashboard.stats.logs')}
          value={stats.recentLogs.toString()}
          color="bg-[var(--yellow)] text-[var(--dark-green)]"
        />
      </div>

      {/* All Sectors Watch */}
      <Link
        href={navigation.allSectorsWatch.href}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-xl border border-[var(--yellow)]/20 bg-[var(--dark-green)] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--medium-green)]/30 transition-transform duration-500 group-hover:scale-125" />
          <div className="absolute -bottom-16 -right-4 h-32 w-32 rounded-full bg-[var(--wine)]/20" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--yellow)] text-2xl text-[var(--dark-green)] shadow-md">
                <FiGlobe />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[var(--white)] md:text-2xl">
                  {navigation.allSectorsWatch.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-[var(--white)]/75 md:text-base">
                  {navigation.allSectorsWatch.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-lg bg-[var(--yellow)] px-4 py-3 font-semibold text-[var(--dark-green)] transition-colors duration-300 group-hover:bg-[var(--white)] md:self-center">
              Open Watch
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Recent Activity */}
      <div className="rounded-xl border border-[var(--yellow)]/20 bg-[var(--wine)] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--white)]">
          {t('dashboard.recentActivity')}
        </h2>

        <div className="space-y-3 text-sm">
          {stats.lastUpload &&
          stats.lastUpload !== 'No uploads yet' ? (
            <p className="text-[var(--white)]/80">
              {t('dashboard.lastUpload')}:{' '}
              <span className="font-medium">
                {stats.lastUpload}
              </span>
            </p>
          ) : (
            <p className="italic text-[var(--white)]/60">
              {t('dashboard.noUploads')}
            </p>
          )}

          <p className="text-[var(--white)]/80">
            {t('dashboard.activeAdmins')}:{' '}
            <span className="font-medium">
              {stats.activeAdmins}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  badge,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  color: string;
}) => (
  <div
    className={`${color} rounded-xl p-5 text-[var(--white)] shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {badge && (
          <p className="mt-2 text-xs opacity-90">{badge}</p>
        )}
      </div>

      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FaExclamationTriangle className="mb-4 text-5xl text-[var(--yellow)]" />
    <p className="text-lg text-[var(--white)]">{message}</p>
  </div>
);