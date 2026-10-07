'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FaLeaf } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';

import Footer from '@/components/Footer';
import SimpleNavbar from '@/components/SimpleNavbar';
import { createClient } from '@/lib/supabase/client';

const products = [
  { nameKey: 'agric_input', slug: 'agric' },
  { nameKey: 'nutrition', slug: 'nutrition' },
  { nameKey: 'livestock', slug: 'livestock' },
  { nameKey: 'macroeconomics_indices', slug: 'macroeconomics-indices' },
  { nameKey: 'rice_production', slug: 'rice' },
  { nameKey: 'all_sectors_watch', slug: 'all-sectors-watch' },
] as const;

export default function ProductSelection() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation('common');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const countryParam = params.country;
  const countrySlug = Array.isArray(countryParam)
    ? countryParam[0]
    : countryParam;

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
    };

    void checkSession();
  }, [router]);

  if (!isAuthenticated || !countrySlug) {
    return null;
  }

  const countryName =
    countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1);

  return (
    <div className="min-h-screen bg-[var(--yellow)]">
      <SimpleNavbar/>

      <div className="mx-auto w-full p-6 sm:w-[80%]">
        <h1 className="mb-6 text-2xl font-bold text-[var(--dark-green)]">
          {t('productSelection.title', { countryName })}
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isAllSectorsWatch = product.slug === 'all-sectors-watch';

            return (
              <Link
                key={product.slug}
                href={`/${countrySlug}/dashboard/${product.slug}`}
                className="flex items-center rounded-lg bg-[var(--white)] p-4 text-[var(--dark-green)] shadow-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--white)]"
              >
                {isAllSectorsWatch ? (
                  <FiGlobe className="mr-2 shrink-0" />
                ) : (
                  <FaLeaf className="mr-2 shrink-0" />
                )}

                <span className="font-medium">
                  {t(`productSelection.items.${product.nameKey}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}