'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowRight, Globe2, BarChart3, Database } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { t } = useTranslation('common');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sector ticker keys — same i18n keys, new presentation
  const slides = [
    'agricInput',
    'agroHydro',
    'agricProduction',
    'agricMarket',
    'foodStocks',
    'nutrition',
    'livestock',
    'fishery',
    'aquaculture',
    'research',
    'macro',
  ];

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section
      className="relative isolate flex min-h-[420px] w-full items-center overflow-hidden bg-gradient-to-br from-[var(--dark-green)] via-[#075b3d] to-[#0a3d2a] text-white sm:min-h-[560px] lg:min-h-[640px]"
      aria-labelledby="home-hero-heading"
    >
      {/* ─── Layer 1: Background image ─────────────────────────────── */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/Hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25"
          aria-hidden="true"
        />
      </div>

      {/* ─── Layer 2: Brand light layers ───────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 15% 35%, rgba(250, 204, 21, 0.14), transparent 55%), radial-gradient(ellipse 70% 45% at 85% 15%, rgba(34, 197, 94, 0.18), transparent 50%), radial-gradient(ellipse 55% 40% at 70% 85%, rgba(190, 24, 93, 0.08), transparent 55%)',
        }}
      />

      {/* ─── Layer 3: Grid texture ─────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      {/* ─── Layer 4: Floating glow orbs ───────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-[var(--yellow)]/15 blur-3xl motion-safe:animate-[float_12s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]"
        aria-hidden="true"
      />

      {/* ─── Content ───────────────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ───── LEFT — Content ───── */}
          <div className="flex flex-col lg:col-span-7">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--yellow)]/25 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--yellow)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)] sm:text-xs">
                Initiative of ECOAGRIS
              </p>
            </div>

            {/* Main Heading */}
            <h1
              id="home-hero-heading"
              className="mt-4 max-w-2xl text-[clamp(1.75rem,4.5vw+0.5rem,3.75rem)] font-bold leading-[1.12] tracking-tight text-white sm:leading-[1.08]"
            >
              ECOWAS West African Agricultural Tracking and Convergence Hub
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-xl text-[clamp(0.95rem,1.5vw+0.4rem,1.25rem)] font-medium leading-snug text-emerald-50/95 sm:mt-5">
              {t('hero.subheadline', {
                defaultValue:
                  'One regional gateway for credible agricultural data, evidence and intelligence across West Africa.',
              })}
            </p>

            {/* Description */}
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/75 sm:mt-4 sm:text-base">
              Discover, explore and understand agricultural data from across
              ECOWAS, bringing together reliable information from recognised
              sources into one accessible, structured environment for research,
              policy and investment.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-6 py-3 text-sm font-semibold text-[var(--dark-green)] shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] motion-reduce:transition-none sm:text-base"
              >
                {t('hero.cta', { defaultValue: 'Explore the Platform' })}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:text-base"
              >
                Learn More
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60 sm:mt-8 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[var(--yellow)]" aria-hidden="true" />
                15 ECOWAS Countries
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--yellow)]" aria-hidden="true" />
                Multiple Credible Sources
              </span>
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--yellow)]" aria-hidden="true" />
                2006–2025 Coverage
              </span>
            </div>
          </div>

          {/* ───── RIGHT — Sector Ticker Panel ───── */}
          <div className="relative w-full lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
              {/* Top accent */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--dark-green)] via-[var(--yellow)] to-[var(--dark-green)] opacity-80"
                aria-hidden="true"
              />

              {/* Header */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--yellow)] sm:text-xs">
                  Sectors in View
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--yellow)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--yellow)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--yellow)] motion-reduce:animate-none" />
                  Live
                </span>
              </div>

              {/* Carousel */}
              <div className="relative min-h-[110px] sm:min-h-[120px]">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  aria-live="polite"
                >
                  {slides.map((key) => (
                    <div
                      key={key}
                      className="min-w-full px-6"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${currentSlide + 1} of ${slides.length}`}
                    >
                      <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">
                        {t(`hero.slides.${key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">
                        {t(`hero.slides.${key}.desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots */}
              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                {slides.map((key, index) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={currentSlide === index}
                    className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] ${
                      currentSlide === index
                        ? 'w-6 bg-[var(--yellow)]'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative glow */}
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.5rem] bg-gradient-to-br from-[var(--yellow)]/15 via-transparent to-emerald-300/10 blur-md"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[float_12s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[float_16s_ease-in-out_infinite_reverse\\] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;