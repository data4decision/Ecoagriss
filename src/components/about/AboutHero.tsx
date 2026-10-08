'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Layers,
  Database,
  Globe2,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface IntelligenceMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/* Static content (abstract labels — not claimed live stats)                  */
/* -------------------------------------------------------------------------- */

const INTELLIGENCE_METRICS: IntelligenceMetric[] = [
  {
    label: 'Regional Scope',
    value: 'West Africa',
    icon: <Globe2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    label: 'Geographic Reach',
    value: 'Multi-Country Coverage',
    icon: <MapPin className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    label: 'Focus Area',
    value: 'Agricultural Indicators',
    icon: <Layers className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    label: 'Intelligence Layer',
    value: 'Multiple Data Sources',
    icon: <Database className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />,
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AboutHero() {
  return (
    <section
      className="relative isolate flex min-h-[250px] w-full items-center overflow-hidden sm:min-h-[560px] lg:min-h-[620px]"
      aria-labelledby="about-hero-heading"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Layer 1 — Agricultural background image                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/west-africa-agriculture.jpg"
          alt="Aerial view of productive farmland across West Africa"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Layer 2 — Dark green / deep teal gradient overlay                   */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--dark-green)]/35 via-[var(--medium-green)]/20 to-[var(--olive-green)]/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--dark-green)]/80 via-transparent to-[var(--olive-green)]/40"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Layer 3 — Subtle grid pattern                                       */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Layer 4 — Faint West Africa map silhouette + connection lines       */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden opacity-30 lg:block"
        aria-hidden="true"
      >
        <svg
          className="absolute right-[8%] top-1/2 h-[70%] w-[42%] -translate-y-1/2"
          viewBox="0 0 400 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified West Africa outline */}
          <path
            d="M80 60 C120 40 180 35 220 50 C260 65 290 90 310 130 C330 170 340 210 320 250 C300 290 260 310 210 320 C160 330 110 310 80 270 C50 230 45 180 55 130 C65 90 70 70 80 60 Z"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            fill="rgba(0,129,0,0.06)"
          />
          {/* Connection lines */}
          <path
            d="M140 140 Q200 120 260 160"
            stroke="rgba(255,220,36,0.25)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M160 200 Q220 180 280 210"
            stroke="rgba(255,220,36,0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M120 180 Q180 220 240 240"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          {/* Data points */}
          <circle cx="140" cy="140" r="3.5" fill="rgba(255,220,36,0.7)" className="motion-safe:animate-[pulse-soft_4s_ease-in-out_infinite]" />
          <circle cx="260" cy="160" r="3" fill="rgba(255,255,255,0.5)" className="motion-safe:animate-[pulse-soft_5s_ease-in-out_infinite_0.5s]" />
          <circle cx="160" cy="200" r="3" fill="rgba(255,220,36,0.55)" className="motion-safe:animate-[pulse-soft_4.5s_ease-in-out_infinite_1s]" />
          <circle cx="280" cy="210" r="2.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="240" cy="240" r="3" fill="rgba(0,129,0,0.7)" />
          <circle cx="200" cy="120" r="2.5" fill="rgba(255,255,255,0.45)" />
        </svg>
      </div>

      {/* Soft radial accent */}
      <div
        className="pointer-events-none absolute -right-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-[var(--green)]/10 blur-3xl"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* LEFT — Text content */}
          <div className="flex flex-col lg:col-span-6 xl:col-span-7 motion-safe:animate-[fade-up_0.7s_ease-out_both]">
            {/* Eyebrow */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--dark-green)] sm:text-xs">
              ECOAGRIS e-WATCH
            </p>

            {/* Small descriptor */}
            <p className="mt-1.5 text-xs font-medium text-white/75 sm:mt-2 sm:text-base">
              West Africa Agricultural Tracking and Convergence Hub
            </p>

            {/* Main headline — single h1 */}
            <h1
              id="about-hero-heading"
              className="mt-3 max-w-xl text-xl font-bold leading-[1.2] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl"
            >
              Connecting West Africa Through Agricultural Data Intelligence
            </h1>

            {/* Description */}
            <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/80 sm:mt-5 sm:text-sm md:text-base">
              Discover, explore and understand credible agricultural data from
              across West Africa through one accessible regional intelligence
              platform.
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[var(--green)]/20 transition-all duration-300 hover:bg-[var(--dark-green)] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] active:scale-[0.98] motion-reduce:transition-none sm:px-6 sm:py-3 sm:text-base"
              >
                Explore Agricultural Data
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* RIGHT — Intelligence visual panel */}
          <div className="relative hidden lg:col-span-6 lg:block xl:col-span-5 motion-safe:animate-[fade-in-right_0.8s_ease-out_0.15s_both]">
            {/* Main glass panel */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md">
              {/* Top accent */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-80"
                aria-hidden="true"
              />

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--yellow)]">
                Agricultural Intelligence
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                Regional Data Convergence
              </p>

              <p className="mt-2 text-sm leading-relaxed text-white/65">
                A unified view of agricultural tracking across West Africa —
                structured for research, policy and decision support.
              </p>

              {/* Metrics grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {INTELLIGENCE_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition-colors hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-2 text-white/50">
                      {metric.icon}
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {metric.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smaller floating card — top right */}
            <div
              className="absolute -right-2 -top-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md motion-safe:animate-[float_8s_ease-in-out_infinite]"
              aria-hidden="true"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                Focus
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                Evidence &amp; Insights
              </p>
            </div>

            {/* Smaller floating card — bottom left */}
            <div
              className="absolute -bottom-3 -left-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md motion-safe:animate-[float_10s_ease-in-out_infinite_reverse]"
              aria-hidden="true"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                Platform Role
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                Tracking &amp; Convergence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[fade-up_0\\.7s_ease-out_both\\],
          .motion-safe\\:animate-\\[fade-in-right_0\\.8s_ease-out_0\\.15s_both\\],
          .motion-safe\\:animate-\\[float_8s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[float_10s_ease-in-out_infinite_reverse\\],
          .motion-safe\\:animate-\\[pulse-soft_4s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[pulse-soft_5s_ease-in-out_infinite_0\\.5s\\],
          .motion-safe\\:animate-\\[pulse-soft_4\\.5s_ease-in-out_infinite_1s\\] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}