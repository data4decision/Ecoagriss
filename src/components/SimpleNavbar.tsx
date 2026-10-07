'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft } from 'react-icons/fi';

import LanguageSwitcher from './LanguageSwitcher';

export default function SimpleNavbar() {
  const { t } = useTranslation('common');

  return (
    <nav className="flex items-center justify-between bg-[var(--medium-green)] px-6 py-6 text-white shadow-md">
      {/* Logo + name */}
      <Link
        href="https://www.data4decision.org/"
        className="flex items-center text-xl font-bold"
      >
        <Image
          src="/logo.png"
          alt="Data4Decision Logo"
          width={32}
          height={32}
          className="mr-2 inline-block h-8 w-8"
        />
        <span>{t('navbar.ecoagris')}</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageSwitcher />

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--yellow)] px-3 py-2 text-sm font-semibold text-[var(--medium-green)] transition hover:bg-opacity-90"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('navbar.backToHome', { defaultValue: 'Back to Home' })}
          </span>
        </Link>
      </div>
    </nav>
  );
}