'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Globe2, ShieldCheck } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface Country {
  id: number;
  name: string;
}

interface AdminProfile {
  id: string;
  role: string;
  status: string;
}

interface CountryFilterAdminProps {
  selectedCountryId?: number | null;
  onCountryChange?: (countryId: number | null) => void;
}

export default function CountryFilterAdmin({
  selectedCountryId = null,
  onCountryChange,
}: CountryFilterAdminProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(
    selectedCountryId
  );
  const [loading, setLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAdminAndLoadCountries = async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }

          return;
        }

        const { data: adminProfile, error: adminError } = await supabase
          .from('admin_profiles')
          .select('id, role, status')
          .eq('id', user.id)
          .eq('status', 'active')
          .in('role', ['admin', 'super_admin'])
          .maybeSingle<AdminProfile>();

        if (adminError) {
          throw adminError;
        }

        const activeAdmin = Boolean(adminProfile);

        if (!mounted) {
          return;
        }

        setIsAdmin(activeAdmin);

        if (!activeAdmin) {
          setLoading(false);
          return;
        }

        setCountriesLoading(true);

        const { data: countryData, error: countryError } = await supabase
          .from('countries')
          .select('id, name')
          .order('name', { ascending: true });

        if (countryError) {
          throw countryError;
        }

        if (!mounted) {
          return;
        }

        setCountries(countryData ?? []);
      } catch (err: unknown) {
        if (!mounted) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load the country filter.';

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
          setCountriesLoading(false);
        }
      }
    };

    void checkAdminAndLoadCountries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedCountry(selectedCountryId ?? null);
  }, [selectedCountryId]);

  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--dark-green)] via-[#005f00] to-[#003d00] p-5 shadow-lg sm:p-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--yellow)] blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-white/20" />
          <div className="mb-2 h-6 w-64 animate-pulse rounded-lg bg-white/20" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleCountryChange = (value: string) => {
    const countryId = value === 'all' ? null : Number(value);

    setSelectedCountry(countryId);
    onCountryChange?.(countryId);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--dark-green)] via-[#005f00] to-[#003d00] p-5 shadow-lg sm:p-6">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--yellow)]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--yellow)]/30 bg-[var(--yellow)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--yellow)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Control
              </span>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                Admin View
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Filter regional data by country
            </h2>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/65">
              Select a country to explore sector data within the regional
              view.
            </p>
          </div>

          {/* Globe icon */}
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:flex">
            <Globe2 className="h-6 w-6 text-[var(--yellow)]" />
          </div>
        </div>

        {/* Filter control */}
        <div className="rounded-xl border border-white/10 bg-black/15 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Globe2 className="h-5 w-5 text-white/80" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Country
                </p>

                <p className="truncate text-sm font-semibold text-white">
                  {selectedCountry === null
                    ? 'All Countries'
                    : countries.find(
                        (country) => country.id === selectedCountry
                      )?.name ?? 'Select country'}
                </p>
              </div>
            </div>

            <div className="relative w-full md:ml-auto md:max-w-sm">
              <select
                value={selectedCountry === null ? 'all' : String(selectedCountry)}
                onChange={(event) => handleCountryChange(event.target.value)}
                disabled={countriesLoading || countries.length === 0}
                aria-label="Filter regional data by country"
                className="w-full appearance-none rounded-lg border border-white/15 bg-white px-4 py-3 pr-10 text-sm font-medium text-[var(--dark-green)] outline-none transition focus:border-[var(--yellow)] focus:ring-2 focus:ring-[var(--yellow)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="all">All Countries</option>

                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dark-green)]" />
            </div>
          </div>

          {/* Current selection */}
          <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
            <Check className="h-3.5 w-3.5 text-[var(--yellow)]" />

            <span>
              {selectedCountry === null
                ? 'Regional view showing all accessible countries.'
                : 'Regional view filtered to the selected country.'}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-xs text-red-100">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}