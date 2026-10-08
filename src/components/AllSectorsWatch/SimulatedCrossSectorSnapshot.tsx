'use client';

import { useEffect, useState } from 'react';
import { Wheat, Beef, CalendarDays } from 'lucide-react';




/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CrossSectorSnapshotProps {
  countryId?: number | null;
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
/* Dummy Data                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Dummy dataset used while the real Supabase integration is being wired up.
 *
 * - When countryId is null (admin / regional view), we show ECOWAS-wide totals.
 * - When countryId is set, we show a smaller per-country slice.
 *
 * Numbers are deterministic so the UI doesn't flicker between renders.
 */
const DUMMY_SECTORS_REGIONAL: SnapshotSector[] = [
  {
    name: 'Agricultural Inputs',
    description:
      'Fertilizers, seeds, pesticides and related agricultural input indicators.',
    icon: <Wheat className="h-4 w-4" strokeWidth={1.75} />,
    recordCount: 4872,
    countryCount: 15,
    period: '2006–2025',
    available: true,
  },
  {
    name: 'Livestock',
    description: 'Herd sizes, production and livestock sector indicators.',
    icon: <Beef className="h-4 w-4" strokeWidth={1.75} />,
    recordCount: 3641,
    countryCount: 15,
    period: '2006–2025',
    available: true,
  },
];

const DUMMY_SECTORS_SINGLE_COUNTRY: SnapshotSector[] = [
  {
    name: 'Agricultural Inputs',
    description:
      'Fertilizers, seeds, pesticides and related agricultural input indicators.',
    icon: <Wheat className="h-4 w-4" strokeWidth={1.75} />,
    recordCount: 325,
    countryCount: 1,
    period: '2006–2025',
    available: true,
  },
  {
    name: 'Livestock',
    description: 'Herd sizes, production and livestock sector indicators.',
    icon: <Beef className="h-4 w-4" strokeWidth={1.75} />,
    recordCount: 243,
    countryCount: 1,
    period: '2006–2025',
    available: true,
  },
];

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
      setState('loading');

      // Simulate a network delay so the skeleton is briefly visible
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!mounted) return;

      try {
        // Choose the appropriate dummy dataset based on countryId
        const dummyData =
          countryId === null
            ? DUMMY_SECTORS_REGIONAL
            : DUMMY_SECTORS_SINGLE_COUNTRY;

        setSectors(dummyData);
        setState(
          dummyData.some((sector) => sector.recordCount > 0)
            ? 'success'
            : 'empty'
        );
      } catch (err: unknown) {
        console.error('CrossSectorSnapshot load error:', err);
        if (mounted) setState('error');
      }
    }

    void loadSnapshot();

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