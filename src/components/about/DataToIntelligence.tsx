'use client';

import {
  Database,
  GitMerge,
  Table2,
  BarChart3,
  Lightbulb,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FlowStage {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/* Static content                                                             */
/* -------------------------------------------------------------------------- */

const FLOW_STAGES: FlowStage[] = [
  {
    id: 'sources',
    label: 'Multiple Data Sources',
    icon: <Database className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: 'convergence',
    label: 'Data Convergence',
    icon: <GitMerge className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: 'structured',
    label: 'Structured Agricultural Data',
    icon: <Table2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: 'analysis',
    label: 'Analysis & Visualisation',
    icon: <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    id: 'intelligence',
    label: 'Agricultural Intelligence',
    icon: <Lightbulb className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function DataToIntelligence() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--olive-green)]/70 py-4 sm:py-6 md:py-10 lg:py-14"
      aria-labelledby="data-to-intelligence-heading"
    >
      {/* Subtle green grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(var(--olive-green) 1px, transparent 1px),
            linear-gradient(90deg, var(--olive-green) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p
          id="data-to-intelligence-heading"
          className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--white)] sm:text-xs md:mb-4 lg:mb-5"
        >
          How data becomes intelligence
        </p>

        {/* Desktop horizontal (unchanged) */}
        <ol className="hidden items-stretch justify-between gap-2 md:flex lg:gap-3">
          {FLOW_STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className="relative flex flex-1 flex-col items-center"
            >
              <div className="flex w-full flex-col items-center rounded-xl border border-[var(--green)]/15 bg-[var(--white)]/80 px-3 py-3.5 text-center shadow-sm transition-colors hover:border-[var(--green)]/30 hover:bg-[var(--white)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--dark-green)]">
                  {stage.icon}
                </span>
                <span className="mt-2 text-xs font-semibold leading-snug text-[var(--dark-green)] lg:text-sm">
                  {stage.label}
                </span>
              </div>

              {index < FLOW_STAGES.length - 1 && (
                <span
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[var(--yellow)] lg:block font-bold text-lg"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        {/* Mobile vertical (compact - under 150px) */}
        <ol className="flex flex-col gap-0 md:hidden">
          {FLOW_STAGES.map((stage, index) => (
            <li key={stage.id} className="flex flex-col items-center">
              <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-[var(--green)]/15 bg-[var(--white)]/80 px-3 py-1.5 shadow-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--green)]/10 text-[var(--dark-green)]">
                  {/* Clone icon with smaller size on mobile */}
                  <span className="scale-75">
                    {stage.icon}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-[var(--dark-green)] leading-tight">
                  {stage.label}
                </span>
              </div>

              {index < FLOW_STAGES.length - 1 && (
                <span
                  className="py-0 text-[10px] leading-none text-[var(--green)]/40"
                  aria-hidden="true"
                >
                  ↓
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}