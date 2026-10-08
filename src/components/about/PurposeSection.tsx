// components/about/PurposeSection.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Purpose pillars                                                            */
/* -------------------------------------------------------------------------- */

const PILLARS = [
  {
    number: '01',
    title: 'Connect',
    description:
      'Discover agricultural datasets and indicators from recognised sources through one regional access point.',
  },
  {
    number: '02',
    title: 'Clarify',
    description:
      'Structured data, comparisons and visualisations that make agricultural information easier to interpret.',
  },
  {
    number: '03',
    title: 'Enable',
    description:
      'Evidence that supports research, planning, policy, investment and agricultural development.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PurposeSection() {
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
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = (delayMs = 0) => ({
    className: `transition-all duration-700 ease-out motion-reduce:transition-none ${
      isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
    }`,
    style: { transitionDelay: isVisible ? `${delayMs}ms` : '0ms' },
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-x-hidden bg-gradient-to-b from-[#e4efe4] via-[#dce9dc] to-[#d4e4d4] py-12 sm:py-14 lg:py-16"
      aria-labelledby="purpose-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 45% at 10% 30%, color-mix(in srgb, var(--green) 10%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 90% 80%, color-mix(in srgb, var(--olive-green) 8%, transparent) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Image */}
          <div
            className={`relative order-2 lg:order-1 lg:col-span-5 ${reveal(80).className}`}
            style={reveal(80).style}
          >
            <div
              className="absolute -bottom-2.5 -left-2.5 z-0 hidden h-[88%] w-[92%] rounded-lg bg-[var(--yellow)]/75 sm:block"
              aria-hidden="true"
            />

            <div className="relative z-10 overflow-hidden rounded-xl shadow-[0_16px_40px_-14px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[4/5] w-full max-h-[min(42vh,360px)] sm:max-h-[min(48vh,400px)]">
                <Image
                  src="/purpose-agriculture.jpg"
                  alt="Agricultural researcher reviewing crop and field evidence in West Africa"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[var(--dark-green)]/30 to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 flex flex-col lg:order-2 lg:col-span-7">
            <p
              className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green)] sm:text-[11px] ${reveal(0).className}`}
              style={reveal(0).style}
            >
           
              <span>Our Purpose</span>
            </p>

            <h2
              id="purpose-heading"
              className={`mt-2 max-w-lg text-[clamp(1.2rem,2.4vw+0.35rem,1.85rem)] font-bold leading-[1.2] tracking-tight text-[var(--dark-green)] ${reveal(40).className}`}
              style={reveal(40).style}
            >
              Making Agricultural Data Easier to Discover, Understand and Use
            </h2>

            <p
              className={`mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--olive-green)] sm:text-sm ${reveal(80).className}`}
              style={reveal(80).style}
            >
              ECOAGRIS e-WATCH helps people move from scattered agricultural
              information to accessible evidence and intelligence that supports
              research, planning, policy and investment across West Africa.
            </p>

            <p
              className={`mt-2.5 max-w-lg text-[13px] leading-relaxed text-[var(--olive-green)]/90 sm:text-sm ${reveal(110).className}`}
              style={reveal(110).style}
            >
              Valuable agricultural information is often spread across many
              databases and institutions. As a regional convergence and access
              layer, ECOAGRIS e-WATCH makes credible data easier to discover,
              explore, compare and use.
            </p>

            {/* Pillars */}
            <div className="mt-5 sm:mt-6">
              {PILLARS.map((pillar, index) => (
                <article
                  key={pillar.number}
                  className={`border-t border-[var(--dark-green)]/10 py-2.5 first:border-t-0 first:pt-0 last:pb-0 ${reveal(150 + index * 60).className}`}
                  style={reveal(150 + index * 60).style}
                >
                  <div className="flex gap-2.5 sm:gap-3">
                    <span
                      className="w-6 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-[var(--green)]/65"
                      aria-hidden="true"
                    >
                      {pillar.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--dark-green)] sm:text-[13px]">
                        {pillar.title}
                      </h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-[var(--olive-green)]/85 sm:text-[13px]">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <blockquote
              className={`mt-5 border-l-[3px] border-[var(--yellow)] pl-3.5 ${reveal(340).className}`}
              style={reveal(340).style}
            >
              <p className="text-[13px] font-medium italic leading-snug text-[var(--green)] sm:text-sm">
                “Better access to evidence can lead to better understanding.{' '}
                <span className="text-[var(--wine)]">
                  Better understanding can support better decisions.
                </span>
                ”
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}