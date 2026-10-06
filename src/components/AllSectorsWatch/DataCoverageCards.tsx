'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

import {
  Wheat,
  Beef,
  Globe2,
  CalendarDays,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface DatasetRecord {
  id?: string | number;
  country_id?: number | null;
  year?: number | string | null;
  [key: string]: unknown;
}

interface DatasetStats {
  name: string;
  description: string;
  icon: React.ReactNode;
  recordCount: number;
  countryCount: number;
  period: string;
  available: boolean;
}

type LoadState = 'loading' | 'success' | 'empty' | 'error';

interface DataCoverageCardsProps {
  countryId?: number | null;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function extractYear(value: unknown): number | null {
  if (value == null) return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

function computeStats(
  records: DatasetRecord[],
  name: string,
  description: string,
  icon: React.ReactNode
): DatasetStats {
  const recordCount = records.length;

  /*
   * The dataset tables use country_id.
   *
   * RLS controls which records are returned to the current user:
   * - Normal users receive only their country's records.
   * - Admins receive all authorised regional records.
   *
   * When an admin selects a country, the query is additionally
   * filtered by countryId before these statistics are calculated.
   */

  const countrySet = new Set<number>();

  records.forEach((record) => {
    if (
      typeof record.country_id === 'number' &&
      Number.isFinite(record.country_id)
    ) {
      countrySet.add(record.country_id);
    }
  });

  const countryCount = countrySet.size;

  const years: number[] = [];

  records.forEach((record) => {
    const year = extractYear(record.year);

    if (year !== null) {
      years.push(year);
    }
  });

  let period = '—';

  if (years.length > 0) {
    const min = Math.min(...years);
    const max = Math.max(...years);

    period = min === max ? `${min}` : `${min}–${max}`;
  }

  return {
    name,
    description,
    icon,
    recordCount,
    countryCount,
    period,
    available: recordCount > 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border border-[var(--green)]/15 bg-[var(--white)] p-6 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[var(--green)]/10 motion-reduce:animate-none" />

        <div className="flex-1 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />

          <div className="h-4 w-56 animate-pulse rounded bg-[var(--green)]/8 motion-reduce:animate-none" />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="h-10 w-28 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />

        <div className="h-4 w-48 animate-pulse rounded bg-[var(--green)]/8 motion-reduce:animate-none" />

        <div className="h-4 w-24 animate-pulse rounded bg-[var(--green)]/8 motion-reduce:animate-none" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function CoverageCard({ stats }: { stats: DatasetStats }) {
  const countryLabel =
    stats.countryCount === 1
      ? '1 Country'
      : `${stats.countryCount} Countries`;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[var(--green)]/15 bg-[var(--white)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--green)]/35 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-70 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--green)]/10 text-[var(--dark-green)] transition-colors group-hover:bg-[var(--green)]/15 group-hover:text-[var(--green)]">
          <span aria-hidden="true">{stats.icon}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-[var(--dark-green)]">
            {stats.name}
          </h3>

          <p className="mt-0.5 text-sm text-[var(--olive-green)]/80">
            {stats.description}
          </p>
        </div>
      </div>

      {/* Primary statistic */}
      <div className="mt-7">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-3xl font-bold tracking-tight text-[var(--dark-green)] sm:text-4xl">
            {stats.recordCount.toLocaleString()}
          </span>

          <span className="ml-0.5 text-sm font-medium text-[var(--olive-green)]/70">
            Records
          </span>
        </p>
      </div>

      {/* Secondary metadata */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--olive-green)]/85">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Globe2
            className="h-3.5 w-3.5 shrink-0 opacity-70"
            aria-hidden="true"
          />

          <span>{countryLabel}</span>
        </span>

        <span
          className="text-[var(--green)]/40"
          aria-hidden="true"
        >
          •
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDays
            className="h-3.5 w-3.5 shrink-0 opacity-70"
            aria-hidden="true"
          />

          <span>{stats.period}</span>
        </span>
      </div>

      {/* Status */}
      <div className="mt-5 flex items-center gap-2">
        {stats.available ? (
          <>
            <span
              className="relative flex h-2 w-2 shrink-0"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--green)] opacity-40 motion-reduce:animate-none" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--green)]" />
            </span>

            <span className="text-sm font-medium text-[var(--dark-green)]">
              Available
            </span>
          </>
        ) : (
          <>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-[var(--wine)]/40"
              aria-hidden="true"
            />

            <span className="text-sm font-medium text-[var(--wine)]/80">
              No data
            </span>
          </>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function DataCoverageCards({
  countryId = null,
}: DataCoverageCardsProps) {
  const [state, setState] = useState<LoadState>('loading');
  const [datasets, setDatasets] = useState<DatasetStats[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadCoverage() {
      setState('loading');

      try {
        const supabase = createClient();

        /*
         * RLS remains the primary security layer.
         *
         * For admins:
         * - countryId === null → all countries allowed by RLS
         * - countryId !== null → selected country
         *
         * For normal users:
         * - RLS still restricts the returned records to their country.
         * - The additional countryId filter cannot bypass RLS.
         */

        const inputsQuery = supabase
          .from('agricultural_inputs')
          .select('id, country_id, year');

        const livestockQuery = supabase
          .from('livestock_data')
          .select('id, country_id, year');

        if (countryId !== null) {
          inputsQuery.eq('country_id', countryId);
          livestockQuery.eq('country_id', countryId);
        }

        const [inputsResult, livestockResult] = await Promise.all([
          inputsQuery,
          livestockQuery,
        ]);

        if (inputsResult.error) {
          console.error(
            'agricultural_inputs fetch error:',
            inputsResult.error
          );

          throw inputsResult.error;
        }

        if (livestockResult.error) {
          console.error(
            'livestock_data fetch error:',
            livestockResult.error
          );

          throw livestockResult.error;
        }

        const inputs = (inputsResult.data ?? []) as DatasetRecord[];

        const livestock = (livestockResult.data ?? []) as DatasetRecord[];

        const stats: DatasetStats[] = [
          computeStats(
            inputs,
            'Agricultural Inputs',
            'Fertilizers, seeds, pesticides and related input indicators',
            <Wheat
              className="h-5 w-5"
              strokeWidth={1.75}
            />
          ),

          computeStats(
            livestock,
            'Livestock',
            'Herd sizes, production and livestock sector indicators',
            <Beef
              className="h-5 w-5"
              strokeWidth={1.75}
            />
          ),
        ];

        if (!mounted) return;

        const hasAnyData = stats.some(
          (dataset) => dataset.recordCount > 0
        );

        setDatasets(stats);
        setState(hasAnyData ? 'success' : 'empty');
      } catch (err: unknown) {
        console.error('DataCoverageCards load error:', err);

        if (mounted) {
          setState('error');
        }
      }
    }

    void loadCoverage();

    return () => {
      mounted = false;
    };
  }, [countryId]);

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-b from-[var(--white)] via-[#f7faf7] to-[#f0f5f0] py-14 sm:py-16 lg:py-20"
      aria-labelledby="data-coverage-heading"
    >
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(var(--green) 1px, transparent 1px),
            linear-gradient(90deg, var(--green) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft green glow */}
      <div
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[var(--green)]/5 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[var(--dark-green)]/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--green)] sm:text-xs">
            Data Coverage
          </p>

          <h2
            id="data-coverage-heading"
            className="mt-2 text-[clamp(1.5rem,3vw+0.5rem,2.25rem)] font-bold leading-tight tracking-tight text-[var(--dark-green)]"
          >
            Explore the data behind Ecoagris intelligence
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--olive-green)]/80 sm:text-base">
            Monitor the sectors, countries and historical periods covered by
            the Ecoagris data platform.
          </p>
        </div>

        {/* Content states */}
        {state === 'loading' && (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
            aria-busy="true"
            aria-label="Loading coverage data"
          >
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {state === 'error' && (
          <div
            className="rounded-2xl border border-[var(--green)]/15 bg-[var(--white)] px-6 py-10 text-center shadow-sm"
            role="alert"
          >
            <p className="text-base font-medium text-[var(--dark-green)]">
              We couldn&apos;t load coverage information right now.
            </p>

            <p className="mt-1 text-sm text-[var(--olive-green)]/70">
              Please try again later.
            </p>
          </div>
        )}

        {state === 'empty' && (
          <div className="rounded-2xl border border-[var(--green)]/15 bg-[var(--white)] px-6 py-10 text-center shadow-sm">
            <p className="text-base font-medium text-[var(--dark-green)]">
              No coverage data is currently available.
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {datasets.map((dataset) => (
              <CoverageCard
                key={dataset.name}
                stats={dataset}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}