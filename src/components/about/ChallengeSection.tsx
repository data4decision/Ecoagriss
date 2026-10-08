// components/about/ChallengeSection.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Challenge items                                                            */
/* -------------------------------------------------------------------------- */

const CHALLENGES = [
  {
    number: '01',
    title: 'Fragmented Sources',
    description:
      'Agricultural information is spread across many databases, reports and platforms.',
  },
  {
    number: '02',
    title: 'Difficult Discovery',
    description:
      'Finding the right dataset or indicator often means searching several sources.',
  },
  {
    number: '03',
    title: 'Complex Comparison',
    description:
      'Comparing countries, periods and indicators requires extra effort to align data.',
  },
  {
    number: '04',
    title: 'Limited Reusability',
    description:
      'Hard-to-find information is harder to reuse for research, planning and decisions.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ChallengeSection() {
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
      aria-labelledby="challenge-heading"
    >
      {/* Soft atmospheric wash */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 45% at 85% 25%, color-mix(in srgb, var(--green) 10%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 10% 75%, color-mix(in srgb, var(--olive-green) 8%, transparent) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* ============================================================ */}
          {/* CONTENT                                                      */}
          {/* ============================================================ */}
          <div className="flex flex-col lg:col-span-7">
            {/* Eyebrow */}
            <p
              className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green)] sm:text-[11px] ${reveal(0).className}`}
              style={reveal(0).style}
            >
              
             
              <span>The Challenge We Address</span>
            </p>

            {/* Heading */}
            <h2
              id="challenge-heading"
              className={`mt-2 max-w-lg text-[clamp(1.2rem,2.4vw+0.35rem,1.85rem)] font-bold leading-[1.2] tracking-tight text-[var(--dark-green)] ${reveal(40).className}`}
              style={reveal(40).style}
            >
              Agricultural Data Exists.{' '}
              <span className="text-[var(--green)]">
                Finding and Using It Is the Challenge.
              </span>
            </h2>

            {/* Intro */}
            <p
              className={`mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--olive-green)] sm:text-sm ${reveal(80).className}`}
              style={reveal(80).style}
            >
              Across West Africa, valuable agricultural information is produced
              by many institutions, but it is often scattered across databases,
              reports and platforms, making discovery and reuse harder.
            </p>

            {/* Challenge grid — 2×2 on sm+ */}
            <ol className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-3.5">
              {CHALLENGES.map((item, index) => (
                <li
                  key={item.number}
                  className={`rounded-lg border border-[var(--dark-green)]/10 bg-[var(--white)]/60 px-3.5 py-3 backdrop-blur-[2px] transition-shadow duration-300 hover:shadow-sm ${reveal(140 + index * 70).className}`}
                  style={reveal(140 + index * 70).style}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="shrink-0 text-sm font-bold tabular-nums text-[var(--green)]/65"
                      aria-hidden="true"
                    >
                      {item.number}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--dark-green)] sm:text-[13px]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-[var(--olive-green)]/85 sm:text-[13px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Key statement */}
            <blockquote
              className={`mt-5 border-l-[3px] border-[var(--yellow)] pl-3.5 ${reveal(420).className}`}
              style={reveal(420).style}
            >
              <p className="text-[13px] font-medium italic leading-snug text-[var(--green)] sm:text-sm">
                The challenge is not simply finding data.{' '}
                <span className="text-[var(--wine)]">
                  It is making the right evidence easier to discover, understand
                  and use.
                </span>
              </p>
            </blockquote>
          </div>

          {/* ============================================================ */}
          {/* IMAGE                                                        */}
          {/* ============================================================ */}
          <div
            className={`relative lg:col-span-5 ${reveal(100).className}`}
            style={reveal(100).style}
          >
            {/* Yellow offset accent */}
            <div
              className="absolute -bottom-2.5 -right-2.5 z-0 hidden h-[88%] w-[92%] rounded-lg bg-[var(--yellow)]/75 sm:block"
              aria-hidden="true"
            />

            <div className="relative z-10 overflow-hidden rounded-xl shadow-[0_16px_40px_-14px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[4/5] w-full max-h-[min(42vh,360px)] sm:max-h-[min(48vh,400px)]">
                <Image
                  src="/agresearch.jpg"
                  alt="Agricultural researcher reviewing field data in a West African setting"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--dark-green)]/70 via-[var(--dark-green)]/20 to-transparent"
                  aria-hidden="true"
                />
                <p className="absolute bottom-3 left-3 right-3 text-[11px] font-medium leading-snug text-[var(--white)]/95 sm:bottom-4 sm:left-4 sm:text-xs">
                  Agricultural evidence exists across the region.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}