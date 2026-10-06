'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaLeaf } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

const products = [
  { nameKey: 'agric_input', slug: 'agric' },
  // { nameKey: 'agro_hydro_meteorology', slug: 'agro-hydro-meteorology' },
  // { nameKey: 'agricultural_production', slug: 'agricultural-production' },
  // { nameKey: 'agricultural_market', slug: 'agricultural-market' },
  // { nameKey: 'food_stocks', slug: 'food-stocks' },
  { nameKey: 'nutrition', slug: 'nutrition' },
  { nameKey: 'livestock', slug: 'livestock' },
  // { nameKey: 'fishery', slug: 'fishery' },
  // { nameKey: 'aquaculture', slug: 'aquaculture' },
  // { nameKey: 'agric_research_results', slug: 'agric-research-results' },
  { nameKey: 'macroeconomics_indices', slug: 'macroeconomics-indices' },
  { nameKey: 'rice_production', slug: 'rice' }
];

export default function ProductSelection() {
  const router = useRouter();
  const { country } = useParams();
  const [user, setUser] = useState<unknown>(null);
  const { t } = useTranslation('common');

useEffect(() => {
  const supabase = createClient();

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
    } else {
      router.push('/login');
    }
  };

  checkSession();
}, [router]);

  if (!user) return null;

  const countryName =
    (country as string).charAt(0).toUpperCase() + (country as string).slice(1);

  return (
    <div className="min-h-screen bg-[var(--yellow)]">
      <Navbar />
      <div className="p-6 w-full sm:w-[80%] mx-auto">
        <h1 className="text-2xl font-bold text-[var(--dark-green)] mb-6">
          {t('productSelection.title', { countryName })}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/${country}/dashboard/${product.slug}`}
              className="flex items-center p-4 bg-[var(--white)] text-[var(--dark-green)] rounded-lg hover:bg-[var(--wine)] hover:text-[var(--white)] transition-colors shadow-sm"
            >
              <FaLeaf className="mr-2" />
              <span className="font-medium">
                {t(`productSelection.items.${product.nameKey}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
