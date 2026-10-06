
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Wheat,
  Beef,
  CalendarDays,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CrossSectorSnapshotProps {
  countryId?: number | null;
}

interface DatasetRecord {
  id: string | number;
  country_id: number | null;
  year: number | string | null;
}

interface SnapshotSector {
  name: string;
  description: string;
  icon: React.ReactNode;
  recordCount: number;
  countryCount: number;
  period: string;
  available: boolean;
}

type LoadState = 'loading' | 'success' | 'empty' | 'error';

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
): SnapshotSector {
  const recordCount = records.length;

  /*
   * Dataset tables use country_id.
   *
   * RLS controls which records are returned:
   * - Normal users receive only their country's records.
   * - Admins receive all authorised ECOWAS records.
   *
   * Counting unique country_id values therefore reflects
   * the user's authorised data coverage.
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

function SnapshotSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] shadow-sm"
      aria-hidden="true"
    >
      <div
        className="h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-50"
      />

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-4 hidden grid-cols-4 gap-4 border-b border-[var(--green)]/10 pb-3 sm:grid">
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
          <div className="h-3 w-14 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
          <div className="h-3 w-18 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
        </div>

        {[0, 1].map((i) => (
          <div
            key={i}
            className="border-b border-[var(--green)]/8 py-4 last:border-b-0 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--green)]/10 motion-reduce:animate-none" />
              <div className="h-4 w-36 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
            </div>

            <div className="mt-3 space-y-2 sm:mt-0">
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
              <div className="h-1.5 w-full max-w-[6rem] animate-pulse rounded-full bg-[var(--green)]/8 motion-reduce:animate-none" />
            </div>

            <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none sm:mt-0" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none sm:mt-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sector row                                                                 */
/* -------------------------------------------------------------------------- */

function SectorRow({
  sector,
  maxRecords,
}: {
  sector: SnapshotSector;
  maxRecords: number;
}) {
  const countryLabel =
    sector.countryCount === 1
      ? '1 Country'
      : `${sector.countryCount} Countries`;

  const barWidth =
    maxRecords > 0
      ? Math.max((sector.recordCount / maxRecords) * 100, 0)
      : 0;

  return (
    <div className="border-b border-[var(--green)]/8 py-4 last:border-b-0 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
      {/* Sector */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--dark-green)]">
          <span aria-hidden="true">{sector.icon}</span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--dark-green)] sm:text-base">
            {sector.name}
          </p>

          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--olive-green)]/70 sm:hidden">
            {sector.description}
          </p>
        </div>
      </div>

      {/* Records + relative volume bar */}
      <div className="mt-3 sm:mt-0">
        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-[var(--olive-green)]/70 sm:hidden">
            Records
          </span>

          <span className="text-sm font-medium tabular-nums text-[var(--dark-green)]">
            {sector.recordCount.toLocaleString()}
          </span>
        </div>

        <div
          className="mt-1.5 h-1.5 w-full max-w-[8rem] overflow-hidden rounded-full bg-[var(--green)]/10"
          role="presentation"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-[var(--green)]/60 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Countries */}
      <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-0 sm:block">
        <span className="text-xs text-[var(--olive-green)]/70 sm:hidden">
          Countries
        </span>

        <span className="text-sm text-[var(--olive-green)]/90">
          {countryLabel}
        </span>
      </div>

      {/* Period */}
      <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-0 sm:block">
        <span className="text-xs text-[var(--olive-green)]/70 sm:hidden">
          Period
        </span>

        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--olive-green)]/90">
          <CalendarDays
            className="hidden h-3.5 w-3.5 shrink-0 opacity-70 sm:inline"
            aria-hidden="true"
          />

          {sector.period}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function CrossSectorSnapshot({
  countryId = null,
}: CrossSectorSnapshotProps) {
  const [state, setState] = useState<LoadState>('loading');
  const [sectors, setSectors] = useState<SnapshotSector[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadSnapshot() {
      try {
        const supabase = createClient();

        /*
         * Build separate query builders so the optional country filter
         * can be applied without changing the RLS behaviour.
         */
        const inputsQuery = supabase
          .from('agricultural_inputs')
          .select('id, country_id, year');

        const livestockQuery = supabase
          .from('livestock_data')
          .select('id, country_id, year');

        /*
         * Admins can select a specific country from the CountryFilterAdmin.
         *
         * When countryId is null:
         * - Normal users receive only their authorised country through RLS.
         * - Admins receive all authorised countries through RLS.
         *
         * When countryId has a value:
         * - The query is additionally restricted to that country.
         *
         * RLS remains the security boundary.
         */
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

        const stats: SnapshotSector[] = [
          computeStats(
            inputs,
            'Agricultural Inputs',
            'Fertilizers, seeds, pesticides and related agricultural input indicators.',
            <Wheat
              className="h-4 w-4"
              strokeWidth={1.75}
            />
          ),

          computeStats(
            livestock,
            'Livestock',
            'Herd sizes, production and livestock sector indicators.',
            <Beef
              className="h-4 w-4"
              strokeWidth={1.75}
            />
          ),
        ];

        if (!mounted) return;

        const hasAnyData = stats.some(
          (sector) => sector.recordCount > 0
        );

        setSectors(stats);
        setState(hasAnyData ? 'success' : 'empty');
      } catch (err: unknown) {
        console.error('CrossSectorSnapshot load error:', err);

        if (mounted) {
          setState('error');
        }
      }
    }

    loadSnapshot();

    return () => {
      mounted = false;
    };
  }, [countryId]);

  const maxRecords =
    sectors.length > 0
      ? Math.max(...sectors.map((s) => s.recordCount), 0)
      : 0;

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#c5dbc5] via-[#b8d4b8] to-[#a8c9a8] py-12 sm:py-14 lg:py-16"
      aria-labelledby="cross-sector-snapshot-heading"
    >
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(var(--dark-green) 1px, transparent 1px),
            linear-gradient(90deg, var(--dark-green) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft glows */}
      <div
        className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--yellow)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[var(--dark-green)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-green)] sm:text-xs">
            Cross-Sector Snapshot
          </p>

          <h2
            id="cross-sector-snapshot-heading"
            className="mt-2 text-[clamp(1.5rem,3vw+0.5rem,2.25rem)] font-bold leading-tight tracking-tight text-[var(--dark-green)]"
          >
            A quick view across Ecoagris sectors
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--olive-green)] sm:text-base">
            Compare the available sector data at a glance and understand the
            breadth of Ecoagris coverage.
          </p>
        </div>

        {/* Content states */}
        {state === 'loading' && (
          <div
            aria-busy="true"
            aria-label="Loading cross-sector snapshot"
          >
            <SnapshotSkeleton />
          </div>
        )}

        {state === 'error' && (
          <div
            className="rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] px-6 py-10 text-center shadow-sm"
            role="alert"
          >
            <p className="text-base font-medium text-[var(--dark-green)]">
              We couldn&apos;t load the cross-sector snapshot right now.
            </p>

            <p className="mt-1 text-sm text-[var(--olive-green)]/70">
              Please try again later.
            </p>
          </div>
        )}

        {state === 'empty' && (
          <div className="rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] px-6 py-10 text-center shadow-sm">
            <p className="text-base font-medium text-[var(--dark-green)]">
              No sector snapshot data is currently available.
            </p>

            <p className="mt-1 text-sm text-[var(--olive-green)]/70">
              Sector coverage information will appear here when data becomes
              available.
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="overflow-hidden rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] shadow-sm">
            {/* Top accent */}
            <div
              className="h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-70"
              aria-hidden="true"
            />

            <div className="p-4 sm:p-5 lg:p-6">
              {/* Desktop column headers */}
              <div
                className="mb-1 hidden grid-cols-4 gap-4 border-b border-[var(--green)]/10 pb-3 sm:grid"
                role="row"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--olive-green)]/70">
                  Sector
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--olive-green)]/70">
                  Records
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--olive-green)]/70">
                  Countries
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--olive-green)]/70">
                  Coverage period
                </span>
              </div>

              {/* Sector rows */}
              <div role="list">
                {sectors.map((sector) => (
                  <SectorRow
                    key={sector.name}
                    sector={sector}
                    maxRecords={maxRecords}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

