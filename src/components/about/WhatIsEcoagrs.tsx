'use client';

import type { ReactNode } from 'react';
import {
  Table2,
  Building2,
  Landmark,
  Globe2,
  FlaskConical,
  FileSpreadsheet,
  Network,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SourceNode {
  id: string;
  label: string;
  icon: ReactNode;
  position: string;
}

/* -------------------------------------------------------------------------- */
/* Static content — example sources only (not claimed partners)               */
/* -------------------------------------------------------------------------- */

const SOURCE_NODES: SourceNode[] = [
  {
    id: 'fao',
    label: 'FAO',
    icon: <Landmark className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'left-[6%] top-[10%]',
  },
  {
    id: 'faostat',
    label: 'FAOSTAT',
    icon: <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'right-[6%] top-[8%]',
  },
  {
    id: 'au',
    label: 'African Union',
    icon: <Globe2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'left-[2%] top-[42%]',
  },
  {
    id: 'who',
    label: 'WHO',
    icon: <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'right-[2%] top-[40%]',
  },
  {
    id: 'nsa',
    label: 'National Statistical Agencies',
    icon: <Table2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'left-[8%] bottom-[12%]',
  },
  {
    id: 'regional',
    label: 'Regional Organisations',
    icon: <Network className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'right-[6%] bottom-[14%]',
  },
  {
    id: 'research',
    label: 'Research Institutions',
    icon: <FlaskConical className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />,
    position: 'left-[36%] bottom-[2%]',
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function WhatIsEcoagris() {
  return (
    <section
      className="relative isolate flex min-h-[300px] flex-col justify-center overflow-hidden bg-[var(--green)]/8 py-6 sm:h-dvh sm:py-8 lg:py-10"
      aria-labelledby="what-is-ecoagris-heading"
    >
      {/* Subtle green grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(var(--green) 1px, transparent 1px),
            linear-gradient(90deg, var(--green) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Soft green glows */}
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[var(--green)]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-[var(--yellow)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        {/* Section header — compact on mobile, original on desktop */}
        <div className="mb-3 max-w-2xl shrink-0 sm:mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green)] sm:text-xs">
            About ECOAGRIS e-WATCH
          </p>

          <h2
            id="what-is-ecoagris-heading"
            className="mt-1 text-[clamp(1.15rem,4vw+0.4rem,1.85rem)] font-bold leading-tight tracking-tight text-[var(--dark-green)]"
          >
            What Is ECOAGRIS e-WATCH?
          </h2>

          <p className="mt-1 max-w-xl text-[12px] leading-snug text-[var(--olive-green)]/85 sm:mt-1.5 sm:text-[0.9375rem] sm:leading-relaxed">
            A regional agricultural data convergence hub connecting credible
            agricultural information from across West Africa.
          </p>
        </div>

        {/* Two-column body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 content-center items-center gap-3 sm:gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* LEFT — Visual story */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* Desktop / tablet network */}
            <div
              className="relative mx-auto hidden aspect-square w-full max-w-[340px] sm:block lg:max-w-[380px]"
              aria-hidden="true"
            >
              <svg
                className="absolute inset-0 h-full w-full opacity-25"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 80 C150 50 220 55 270 85 C320 115 350 170 340 230 C330 290 280 330 220 345 C160 360 100 330 75 270 C50 210 60 130 100 80 Z"
                  stroke="var(--green)"
                  strokeWidth="1"
                  fill="rgba(0,129,0,0.05)"
                />
              </svg>

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {[
                  [80, 50],
                  [320, 45],
                  [30, 170],
                  [360, 160],
                  [90, 340],
                  [320, 320],
                  [200, 380],
                ].map(([x, y], i) => (
                  <line
                    key={i}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke="var(--green)"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    strokeDasharray="4 5"
                    className="motion-safe:animate-[line-draw_1.2s_ease-out_both]"
                    style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                  />
                ))}
              </svg>

              {SOURCE_NODES.map((node, index) => (
                <div
                  key={node.id}
                  className={`absolute ${node.position} z-10 max-w-[9rem] motion-safe:animate-[fade-in-scale_0.5s_ease-out_both]`}
                  style={{ animationDelay: `${0.15 + index * 0.07}s` }}
                >
                  <div
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--green)]/15 bg-[var(--white)] px-2.5 py-1.5 shadow-sm motion-safe:animate-[float_7s_ease-in-out_infinite]"
                    style={{ animationDelay: `${index * 0.4}s` }}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--green)]/10 text-[var(--dark-green)]">
                      {node.icon}
                    </span>
                    <span className="truncate text-[10px] font-medium leading-tight text-[var(--dark-green)] sm:text-[11px]">
                      {node.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Central card */}
              <div className="absolute left-1/2 top-1/2 z-20 w-[min(100%,13rem)] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[fade-in-scale_0.6s_ease-out_0.1s_both]">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--green)]/20 bg-[var(--white)] px-4 py-4 text-center shadow-md">
                  <div
                    className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)]"
                    aria-hidden="true"
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--green)]">
                    Platform
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug text-[var(--dark-green)]">
                    ECOAGRIS e-WATCH
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--olive-green)]/80">
                    Regional Agricultural Data Intelligence
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile source list — compact */}
            <div className="sm:hidden" aria-hidden="true">
              <div className="mb-2 overflow-hidden rounded-xl border border-[var(--green)]/15 bg-[var(--white)] px-3 py-2.5 text-center shadow-sm">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--green)]">
                  Platform
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--dark-green)]">
                  ECOAGRIS e-WATCH
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--olive-green)]/80">
                  Regional Agricultural Data Intelligence
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-1">
                {SOURCE_NODES.map((node) => (
                  <span
                    key={node.id}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--green)]/12 bg-[var(--white)]/80 px-1.5 py-0.5 text-[10px] font-medium text-[var(--dark-green)]"
                  >
                    <span className="text-[var(--green)]">{node.icon}</span>
                    {node.label}
                  </span>
                ))}
              </div>

              <p className="mt-1.5 text-center text-[9px] leading-tight text-[var(--olive-green)]/55">
                Illustrative examples — not confirmed partners.
              </p>
            </div>

            {/* Disclaimer — desktop only */}
            <p className="mt-3 hidden text-center text-[10px] text-[var(--olive-green)]/55 sm:mt-4 sm:block sm:text-[11px]">
              Illustrative examples of recognised agricultural data sources —
              not a list of confirmed platform partners.
            </p>
          </div>

          {/* RIGHT — Explanation */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--green)] sm:text-xs">
              A Regional Data Convergence Hub
            </p>

            {/* Mobile: shorter copy */}
            <div className="mt-1.5 space-y-1.5 text-[13px] leading-snug text-[var(--olive-green)]/90 sm:hidden">
              <p>
                ECOAGRIS e-WATCH is a regional agricultural data intelligence
                platform that brings together reliable, structured agricultural
                data from across West Africa into one accessible environment.
              </p>
              <p>
                It provides a convergence layer so users can discover, explore
                and work with information from credible existing sources,
                supporting both data access and data intelligence.
              </p>
            </div>

            {/* Desktop / tablet: full copy */}
            <div className="mt-3 hidden space-y-2.5 text-sm leading-relaxed text-[var(--olive-green)]/90 sm:block sm:text-[0.9375rem]">
              <p>
                ECOAGRIS e-WATCH is a regional agricultural data intelligence
                platform designed to bring together reliable, published and
                structured agricultural data from across West Africa into one
                accessible digital environment.
              </p>
              <p>
                Agricultural information is generated by numerous national,
                regional and international institutions, but this information is
                often distributed across different databases, reports,
                publications and statistical platforms.
              </p>
              <p>
                ECOAGRIS e-WATCH provides a convergence and access layer that
                helps users discover, explore, compare and work with agricultural
                information from credible existing sources.
              </p>
              <p>
                The platform is designed to support both{' '}
                <strong className="font-semibold text-[var(--dark-green)]">
                  data access
                </strong>{' '}
                and{' '}
                <strong className="font-semibold text-[var(--dark-green)]">
                  data intelligence
                </strong>
                , enabling users to move beyond simply finding datasets towards
                understanding agricultural trends, indicators, relationships and
                regional patterns.
              </p>
            </div>

            {/* Highlight statement */}
            <blockquote className="mt-2.5 overflow-hidden rounded-lg border border-[var(--green)]/20 bg-[var(--white)]/70 px-3 py-2 sm:mt-6 sm:rounded-xl sm:px-4 sm:py-3.5">
              <p className="text-[13px] font-semibold leading-snug text-[var(--dark-green)] sm:text-base">
                “From fragmented agricultural data to connected regional
                intelligence.”
              </p>
            </blockquote>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes line-draw {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[fade-in-scale_0\\.5s_ease-out_both\\],
          .motion-safe\\:animate-\\[fade-in-scale_0\\.6s_ease-out_0\\.1s_both\\],
          .motion-safe\\:animate-\\[float_7s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[line-draw_1\\.2s_ease-out_both\\] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}