'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaRegSun,
  FaDatabase,
  FaWrench,
  FaChartLine,
  FaArrowRight,
} from 'react-icons/fa';

const AgriculturalChallengesAndSolutions: React.FC = () => {
  const { t } = useTranslation('common');
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

  const challenges = [
    {
      icon: <FaRegSun />,
      title: t('challenges.list.climateChange.title'),
      desc: t('challenges.list.climateChange.desc'),
    },
    {
      icon: <FaDatabase />,
      title: t('challenges.list.dataAccess.title'),
      desc: t('challenges.list.dataAccess.desc'),
    },
    {
      icon: <FaWrench />,
      title: t('challenges.list.infrastructure.title'),
      desc: t('challenges.list.infrastructure.desc'),
    },
    {
      icon: <FaChartLine />,
      title: t('challenges.list.lowProductivity.title'),
      desc: t('challenges.list.lowProductivity.desc'),
    },
  ];

  const solutions = [
    {
      icon: <FaRegSun />,
      title: t('solutions.list.climateSmart.title'),
      desc: t('solutions.list.climateSmart.desc'),
    },
    {
      icon: <FaDatabase />,
      title: t('solutions.list.dataTransparency.title'),
      desc: t('solutions.list.dataTransparency.desc'),
    },
    {
      icon: <FaWrench />,
      title: t('solutions.list.resourceOptimization.title'),
      desc: t('solutions.list.resourceOptimization.desc'),
    },
    {
      icon: <FaChartLine />,
      title: t('solutions.list.regionalCollaboration.title'),
      desc: t('solutions.list.regionalCollaboration.desc'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="challenges-solutions"
      className="relative w-full overflow-hidden bg-[#fcfcfb] py-12 sm:py-14 md:py-16 lg:py-20"
      aria-labelledby="challenges-solutions-heading"
    >
      {/* Faint dot pattern */}
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

      {/* Soft glows */}
      <div
        className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-[var(--wine)]/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/3 h-72 w-72 rounded-full bg-[var(--green)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* ───────── Section Header ───────── */}
        <div className="mx-auto max-w-2xl text-center">
          <div
            className={`flex items-center justify-center gap-3 ${reveal(0).className}`}
            style={reveal(0).style}
          >
            {/* <span className="text-sm font-bold tracking-widest text-[var(--wine)]">
              02
            </span> */}
            {/* <span
              className="h-px w-6 bg-[var(--yellow)]"
              aria-hidden="true"
            /> */}
            <span className="text-sm font-bold uppercase tracking-widest text-[var(--green)]">
              Challenges &amp; Solutions
            </span>
          </div>

          <h2
            id="challenges-solutions-heading"
            className={`mt-3 text-[clamp(1.5rem,3vw+0.5rem,2.5rem)] font-bold leading-[1.15] text-[var(--dark-green)] ${reveal(100).className}`}
            style={reveal(100).style}
          >
            {t('challenges.title')}
          </h2>

          <p
            className={`mt-3 text-[clamp(0.9375rem,0.6vw+0.75rem,1.0625rem)] leading-[1.7] text-gray-700 ${reveal(200).className}`}
            style={reveal(200).style}
          >
            {t('challenges.subtitle')}
          </p>
        </div>

        {/* ───────── Column Headers (Desktop only) ───────── */}
        <div className="mt-10 hidden grid-cols-2 gap-4 sm:mt-12 sm:grid lg:gap-8">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wine)] text-[11px] font-bold text-white">
              01
            </span>
            <h3 className="text-base font-bold uppercase tracking-widest text-[var(--wine)] sm:text-lg">
              The Challenge
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--green)] text-[11px] font-bold text-white">
              02
            </span>
            <h3 className="text-base font-bold uppercase tracking-widest text-[var(--green)] sm:text-lg">
              Our Approach
            </h3>
          </div>
        </div>

        {/* ───────── Paired Challenge/Solution Rows ───────── */}
        <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
          {challenges.map((challenge, idx) => {
            const solution = solutions[idx];
            const baseDelay = 300 + idx * 120;

            return (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-8"
              >
                {/* CHALLENGE CARD */}
                <article
                  className={`group relative overflow-hidden rounded-xl border border-[var(--wine)]/15 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[var(--wine)]/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-5 ${reveal(baseDelay).className}`}
                  style={reveal(baseDelay).style}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-[var(--wine)]"
                    aria-hidden="true"
                  />

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--wine)]/10 text-[var(--wine)] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                      <span className="text-sm sm:text-base">
                        {challenge.icon}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold leading-snug text-[var(--wine)] sm:text-base">
                        {challenge.title}
                      </h4>
                      <p className="mt-1.5 text-[clamp(0.8125rem,0.4vw+0.65rem,0.9375rem)] leading-[1.65] text-gray-600">
                        {challenge.desc}
                      </p>
                    </div>
                  </div>
                </article>

                {/* SOLUTION CARD */}
                <article
                  className={`group relative overflow-hidden rounded-xl border border-[var(--green)]/15 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[var(--green)]/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-5 ${reveal(baseDelay + 80).className}`}
                  style={reveal(baseDelay + 80).style}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-[var(--green)]"
                    aria-hidden="true"
                  />

                  {/* Connector arrow — desktop only */}
                  <div
                    className="pointer-events-none absolute -left-6 top-1/2 hidden -translate-y-1/2 text-[var(--yellow)] sm:block"
                    aria-hidden="true"
                  >
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--green)]/15 text-[var(--dark-green)] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                      <span className="text-sm sm:text-base">
                        {solution.icon}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold leading-snug text-[var(--green)] sm:text-base">
                        {solution.title}
                      </h4>
                      <p className="mt-1.5 text-[clamp(0.8125rem,0.4vw+0.65rem,0.9375rem)] leading-[1.65] text-gray-600">
                        {solution.desc}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* ───────── CTA ───────── */}
        <div
          className={`mt-10 flex justify-center sm:mt-12 ${reveal(900).className}`}
          style={reveal(900).style}
        >
          <a
            href="#impact"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--green)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--dark-green)] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)] motion-reduce:transition-none sm:text-base"
          >
            {t('challenges.cta')}
            <FaArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AgriculturalChallengesAndSolutions;