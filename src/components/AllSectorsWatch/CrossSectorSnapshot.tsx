
'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wheat, Beef, CalendarDays } from 'lucide-react';

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
  icon: ReactNode;
  recordCount: number;
  countryCount: number;
  period: string;
  available: boolean;
}

type LoadState = 'loading' | 'success' | 'empty' | 'error';

type SectorTable = 'agricultural_inputs' | 'livestock_data';

const PAGE_SIZE = 1000;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function extractYear(value: unknown): number | null {
  if (value == null) return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Fetch every accessible record in batches.
 *
 * RLS remains the database security boundary.
 * An empty countryId means all countries accessible to the
 * authenticated user. A specified countryId filters the results.
 */
async function fetchSectorRecords(
  table: SectorTable,
  countryId: number | null
): Promise<DatasetRecord[]> {
  const supabase = createClient();
  const records: DatasetRecord[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    let query = supabase
      .from(table)
      .select('id, country_id, year')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1);

    if (countryId !== null) {
      query = query.eq('country_id', countryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`${table} fetch error:`, error);
      throw error;
    }

    const batch = (data ?? []) as DatasetRecord[];

    records.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }
  }

  return records;
}

function computeStats(
  records: DatasetRecord[],
  name: string,
  description: string,
  icon: ReactNode
): SnapshotSector {
  const countrySet = new Set<number>();
  const years: number[] = [];

  for (const record of records) {
    if (
      typeof record.country_id === 'number' &&
      Number.isFinite(record.country_id)
    ) {
      countrySet.add(record.country_id);
    }

    const year = extractYear(record.year);

    if (year !== null) {
      years.push(year);
    }
  }

  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

  let period = '—';

  if (minYear !== null && maxYear !== null) {
    period =
      minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
  }

  return {
    name,
    description,
    icon,
    recordCount: records.length,
    countryCount: countrySet.size,
    period,
    available: records.length > 0,
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
      <div className="h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-50" />

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-4 hidden grid-cols-4 gap-4 border-b border-[var(--green)]/10 pb-3 sm:grid">
          {[16, 14, 18, 24].map((width, index) => (
            <div
              key={index}
              className="h-3 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>

        {[0, 1].map((item) => (
          <div
            key={item}
            className="border-b border-[var(--green)]/8 py-4 last:border-b-0 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[var(--green)]/10 motion-reduce:animate-none" />
              <div className="h-4 w-36 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
            </div>

            <div className="mt-3 space-y-2 sm:mt-0">
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--green)]/10 motion-reduce:animate-none" />
              <div className="h-1.5 w-full max-w-[6rem] animate-pulse rounded-full bg-[var(--green)]/10 motion-reduce:animate-none" />
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
    <div
      role="listitem"
      className="border-b border-[var(--green)]/8 py-4 last:border-b-0 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4"
    >
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
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-[var(--green)]/60 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-0 sm:block">
        <span className="text-xs text-[var(--olive-green)]/70 sm:hidden">
          Countries
        </span>

        <span className="text-sm text-[var(--olive-green)]/90">
          {countryLabel}
        </span>
      </div>

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
      setState('loading');

      try {
        const [inputs, livestock] = await Promise.all([
          fetchSectorRecords('agricultural_inputs', countryId),
          fetchSectorRecords('livestock_data', countryId),
        ]);

        const stats: SnapshotSector[] = [
          computeStats(
            inputs,
            'Agricultural Inputs',
            'Fertilizers, seeds, pesticides and related agricultural input indicators.',
            <Wheat className="h-4 w-4" strokeWidth={1.75} />
          ),
          computeStats(
            livestock,
            'Livestock',
            'Herd sizes, production and livestock sector indicators.',
            <Beef className="h-4 w-4" strokeWidth={1.75} />
          ),
        ];

        if (!mounted) return;

        setSectors(stats);
        setState(
          stats.some((sector) => sector.recordCount > 0)
            ? 'success'
            : 'empty'
        );
      } catch (error: unknown) {
        console.error('CrossSectorSnapshot load error:', error);

        if (mounted) {
          setSectors([]);
          setState('error');
        }
      }
    }

    void loadSnapshot();

    return () => {
      mounted = false;
    };
  }, [countryId]);

  const maxRecords =
    sectors.length > 0
      ? Math.max(...sectors.map((sector) => sector.recordCount), 0)
      : 0;

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#c5dbc5] via-[#b8d4b8] to-[#a8c9a8] py-12 sm:py-14 lg:py-16"
      aria-labelledby="cross-sector-snapshot-heading"
    >
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

      <div
        className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--yellow)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[var(--dark-green)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--dark-green)] sm:text-xs">
            Real Data Cross-Sector Snapshot
          </p>

          <h2
            id="cross-sector-snapshot-heading"
            className="mt-2 text-[clamp(1.5rem,3vw+0.5rem,2.25rem)] font-bold leading-tight tracking-tight text-[var(--dark-green)]"
          >
            A quick view across ECOAGRIS sectors
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--olive-green)] sm:text-base">
            Explore agricultural inputs and livestock data across all
            countries represented in the available dataset.
          </p>

          <p className="mt-2 text-xs text-[var(--olive-green)]/80">
            {countryId === null
              ? 'Showing all accessible countries'
              : 'Showing the selected country'}
          </p>
        </div>

        {state === 'loading' && (
          <div aria-busy="true" aria-label="Loading cross-sector snapshot">
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
              Data coverage information will appear here when records are
              available for the selected scope.
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="overflow-hidden rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] shadow-sm">
            <div
              className="h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-70"
              aria-hidden="true"
            />

            <div className="p-4 sm:p-5 lg:p-6">
              <div className="mb-1 hidden grid-cols-4 gap-4 border-b border-[var(--green)]/10 pb-3 sm:grid">
                {['Sector', 'Records', 'Countries', 'Coverage period'].map(
                  (heading) => (
                    <span
                      key={heading}
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--olive-green)]/70"
                    >
                      {heading}
                    </span>
                  )
                )}
              </div>

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
