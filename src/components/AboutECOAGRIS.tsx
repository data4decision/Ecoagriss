'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { FaSeedling, FaLeaf } from 'react-icons/fa';

const AboutECOAGRIS: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = (delayMs = 0) => ({
    className: `transition-all duration-700 ease-out motion-reduce:transition-none ${
      isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
    }`,
    style: { transitionDelay: isVisible ? `${delayMs}ms` : '0ms' },
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#fcfcfb] py-8 sm:py-10 md:py-12 lg:py-14"
      aria-labelledby="about-ecoagris-heading"
    >
      {/* Faint dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, var(--dark-green) 1px, transparent 1px),
            radial-gradient(circle at 85% 80%, var(--dark-green) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Soft accent glows */}
      <div
        className="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-[var(--yellow)]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-1/4 h-56 w-56 rounded-full bg-[var(--green)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* =========================================================== */}
          {/* LEFT — Image                                                 */}
          {/* =========================================================== */}
          <div
            className={`relative lg:col-span-5 ${reveal(0).className}`}
            style={reveal(0).style}
          >
            {/* Yellow offset accent behind image */}
            <div
              className="absolute -bottom-2 -left-2 -z-10 h-full w-full rounded-2xl bg-[var(--yellow)] opacity-80 sm:-bottom-3 sm:-left-3"
              aria-hidden="true"
            />

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
              <Image
                src="/about.jpg"
                alt="ECOWAS agricultural researchers collaborating on regional data"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
                priority
              />
              {/* Subtle dark-green gradient for depth */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--dark-green)]/25 via-transparent to-transparent mix-blend-multiply"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* =========================================================== */}
          {/* RIGHT — Content                                              */}
          {/* =========================================================== */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Eyebrow */}
            <div
              className={`flex items-center gap-3 ${reveal(100).className}`}
              style={reveal(100).style}
            >
              <span className="text-sm font-bold tracking-widest text-[var(--wine)]">
                01
              </span>
              <span
                className="h-px w-6 bg-[var(--yellow)]"
                aria-hidden="true"
              />
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--green)]">
                About ECOAGRIS e-WATCH
              </span>
            </div>

            {/* Main Heading */}
            <h2
              id="about-ecoagris-heading"
              className={`mt-3 max-w-2xl text-[clamp(1.4rem,2.5vw+0.5rem,2.25rem)] font-bold leading-[1.15] text-[var(--dark-green)] ${reveal(150).className}`}
              style={reveal(150).style}
            >
              A regional hub for agricultural data and intelligence across West Africa
            </h2>

            {/* Description */}
            <p
              className={`mt-3 max-w-xl text-[clamp(0.875rem,0.5vw+0.7rem,1rem)] leading-[1.65] text-gray-700 ${reveal(250).className}`}
              style={reveal(250).style}
            >
              ECOAGRIS e-WATCH brings together credible agricultural information
              from across the ECOWAS region into one accessible environment,
              helping researchers, policymakers and investors move from data
              discovery to evidence-based action.
            </p>

            {/* ── Vision & Mission Cards ───────────────────────────── */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4">
              {/* VISION */}
              <article
                className={`group relative overflow-hidden rounded-xl border border-[var(--green)]/15 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[var(--green)]/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-5 ${reveal(350).className}`}
                style={reveal(350).style}
              >
                {/* Left accent bar */}
                <div
                  className="absolute inset-y-0 left-0 w-1 bg-[var(--yellow)]"
                  aria-hidden="true"
                />

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--yellow)]/20 text-[var(--dark-green)] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                    <FaLeaf className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-[var(--wine)] sm:text-xs">
                        01
                      </span>
                      <span
                        className="h-px w-3 bg-[var(--yellow)]"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--green)] sm:text-base">
                        Our Vision
                      </h3>
                    </div>

                    <p className="text-[clamp(0.8125rem,0.4vw+0.65rem,0.9375rem)] leading-[1.65] text-gray-700">
                      Our vision is to become a trusted regional gateway for
                      West African agricultural data and intelligence, enabling
                      stakeholders to move seamlessly from data discovery to
                      analysis, evidence and informed action.
                    </p>
                  </div>
                </div>
              </article>

              {/* MISSION */}
              <article
                className={`group relative overflow-hidden rounded-xl border border-[var(--green)]/15 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[var(--green)]/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-5 ${reveal(500).className}`}
                style={reveal(500).style}
              >
                {/* Left accent bar */}
                <div
                  className="absolute inset-y-0 left-0 w-1 bg-[var(--green)]"
                  aria-hidden="true"
                />

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--green)]/15 text-[var(--dark-green)] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                    <FaSeedling className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-[var(--wine)] sm:text-xs">
                        02
                      </span>
                      <span
                        className="h-px w-3 bg-[var(--green)]"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--green)] sm:text-base">
                        Our Mission
                      </h3>
                    </div>

                    <p className="text-[clamp(0.8125rem,0.4vw+0.65rem,0.9375rem)] leading-[1.65] text-gray-700">
                      Our mission is to converge credible agricultural data,
                      make it accessible in usable formats, and transform it
                      into meaningful intelligence that supports research,
                      policy, investment and sustainable agricultural
                      development across West Africa.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutECOAGRIS;