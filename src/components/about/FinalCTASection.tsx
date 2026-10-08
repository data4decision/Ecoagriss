// components/about/FinalCTASection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // remove if lucide-react is not available; replace with text arrow

/**
 * Final CTA Section – About Us page
 * Premium cinematic closing section for ECOAGRIS e-WATCH.
 * Height is deliberately constrained to 300px on larger screens.
 */

export default function FinalCTASection() {
  // Optional: respect reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative w-full overflow-hidden h-auto min-h-[300px] sm:h-[300px]"
    >
      {/* ─── Layer 1: Background Image ───────────────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src="/purpose-agriculture2.jpg"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      {/* ─── Layer 2: More Transparent Green Gradient Overlay ────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              160deg,
              rgba(0, 125, 0, 0.55) 0%,
              rgba(0, 129, 0, 0.50) 40%,
              rgba(0, 100, 0, 0.65) 100%
            )
          `,
        }}
      />

      {/* Lighter vignette behind text for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, rgba(0, 80, 0, 0.20) 100%)",
        }}
      />

      {/* ─── Layer 3: Decorative Elements ────────────────────────────── */}
      {/* Top-left yellow arc */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-24 w-24 opacity-40 sm:h-32 sm:w-32"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 80 Q40 20 100 0"
          stroke="var(--yellow)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M0 100 Q50 40 120 15"
          stroke="var(--yellow)"
          strokeWidth="1"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Top-right subtle contour lines */}
      <svg
        className="pointer-events-none absolute right-0 top-4 h-32 w-32 opacity-25 sm:h-40 sm:w-40"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M180 20 Q140 60 160 110 Q175 150 120 180"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M200 40 Q150 80 170 130 Q185 170 130 195"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-left field contour lines */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-40 opacity-20"
        viewBox="0 0 260 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 120 Q40 90 80 110 Q130 140 180 100 Q220 70 260 90"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M0 140 Q50 110 100 130 Q150 155 200 120 Q240 95 260 110"
          stroke="white"
          strokeWidth="0.7"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-right curved data-movement line */}
      <svg
        className="pointer-events-none absolute bottom-2 right-2 h-24 w-32 opacity-30 sm:bottom-4 sm:right-6"
        viewBox="0 0 160 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 100 Q50 40 90 60 Q130 80 150 20"
          stroke="var(--yellow)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Optional subtle West-Africa-inspired geometric outline (decorative only) */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        viewBox="0 0 400 320"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M80 60 Q140 30 200 50 Q280 80 320 140 Q340 200 300 250 Q240 290 160 270 Q90 250 70 180 Q50 110 80 60"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {/* Eyebrow */}
          <p
            className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 sm:mb-3 sm:text-xs ${
              prefersReducedMotion ? "" : "animate-fade-up"
            }`}
            style={{ animationDelay: "0ms" }}
          >
            Explore the Data. Understand the Region.
          </p>

          {/* Main Heading */}
          <h2
            id="final-cta-heading"
            className={`mb-3 max-w-2xl text-2xl font-bold leading-tight text-white sm:mb-4 sm:text-3xl lg:text-4xl ${
              prefersReducedMotion ? "" : "animate-fade-up"
            }`}
            style={{ animationDelay: "80ms" }}
          >
            Turn Agricultural Data Into Better Understanding
          </h2>

          {/* Supporting Text */}
          <p
            className={`mb-5 max-w-xl text-xs leading-relaxed text-white/85 sm:mb-6 sm:text-sm md:text-[15px] ${
              prefersReducedMotion ? "" : "animate-fade-up"
            }`}
            style={{ animationDelay: "160ms" }}
          >
            Explore credible agricultural data, compare indicators, discover
            regional trends and access meaningful intelligence through ECOAGRIS
            e-WATCH.
          </p>

          {/* CTAs */}
          <div
            className={`mb-5 flex w-full flex-col items-stretch gap-2.5 sm:mb-6 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-3 ${
              prefersReducedMotion ? "" : "animate-fade-up"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            {/* Primary CTA */}
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-[var(--yellow)] px-5 py-2.5 text-xs font-semibold text-[var(--dark-green)] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f0d020] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] sm:px-6 sm:text-sm"
            >
              Explore Agricultural Data
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-md border border-white/70 bg-transparent px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[var(--dark-green)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:text-sm"
            >
              Discover Data Intelligence
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Closing statement */}
          <p
            className={`text-[10px] font-medium tracking-wide text-white/70 sm:text-xs ${
              prefersReducedMotion ? "" : "animate-fade-up"
            }`}
            style={{ animationDelay: "320ms" }}
          >
            One Region. Multiple Sources.{" "}
            <span className="font-semibold text-[var(--yellow)]">
              One Data Gateway.
            </span>
          </p>
        </div>
      </div>

      {/* ─── Soft transition into footer (Now Black) ─────────────────── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Thin yellow accent line at the very bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-[var(--yellow)]/40"
        aria-hidden="true"
      />

      {/* Local keyframes */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.7s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}