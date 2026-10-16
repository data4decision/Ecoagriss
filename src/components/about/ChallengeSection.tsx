// components/about/ChallengeSection.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CHALLENGE_KEYS = [
  'fragmented',
  'discovery',
  'comparison',
  'reusability',
] as const;

export default function ChallengeSection() {
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
          {/* CONTENT */}
          <div className="flex flex-col lg:col-span-7">
            <p
              className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green)] sm:text-[11px] ${reveal(0).className}`}
              style={reveal(0).style}
            >
              <span>{t('challenge.eyebrow')}</span>
            </p>

            <h2
              id="challenge-heading"
              className={`mt-2 max-w-lg text-[clamp(1.2rem,2.4vw+0.35rem,1.85rem)] font-bold leading-[1.2] tracking-tight text-[var(--dark-green)] ${reveal(40).className}`}
              style={reveal(40).style}
            >
              {t('challenge.title.before')}{' '}
              <span className="text-[var(--green)]">
                {t('challenge.title.highlight')}
              </span>
            </h2>

            <p
              className={`mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--olive-green)] sm:text-sm ${reveal(80).className}`}
              style={reveal(80).style}
            >
              {t('challenge.intro')}
            </p>

            <ol className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-3.5">
              {CHALLENGE_KEYS.map((key, index) => (
                <li
                  key={key}
                  className={`rounded-lg border border-[var(--dark-green)]/10 bg-[var(--white)]/60 px-3.5 py-3 backdrop-blur-[2px] transition-shadow duration-300 hover:shadow-sm ${reveal(140 + index * 70).className}`}
                  style={reveal(140 + index * 70).style}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="shrink-0 text-sm font-bold tabular-nums text-[var(--green)]/65"
                      aria-hidden="true"
                    >
                      {t(`challenge.items.${key}.number`)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--dark-green)] sm:text-[13px]">
                        {t(`challenge.items.${key}.title`)}
                      </h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-[var(--olive-green)]/85 sm:text-[13px]">
                        {t(`challenge.items.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <blockquote
              className={`mt-5 border-l-[3px] border-[var(--yellow)] pl-3.5 ${reveal(420).className}`}
              style={reveal(420).style}
            >
              <p className="text-[13px] font-medium italic leading-snug text-[var(--green)] sm:text-sm">
                {t('challenge.quote.before')}{' '}
                <span className="text-[var(--wine)]">
                  {t('challenge.quote.highlight')}
                </span>
              </p>
            </blockquote>
          </div>

          {/* IMAGE */}
          <div
            className={`relative lg:col-span-5 ${reveal(100).className}`}
            style={reveal(100).style}
          >
            <div
              className="absolute -bottom-2.5 -right-2.5 z-0 hidden h-[88%] w-[92%] rounded-lg bg-[var(--yellow)]/75 sm:block"
              aria-hidden="true"
            />

            <div className="relative z-10 overflow-hidden rounded-xl shadow-[0_16px_40px_-14px_rgba(0,0,0,0.2)]">
              <div className="relative aspect-[4/5] w-full max-h-[min(42vh,360px)] sm:max-h-[min(48vh,400px)]">
                <Image
                  src="/agresearch.jpg"
                  alt={t('challenge.imageAlt')}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--dark-green)]/70 via-[var(--dark-green)]/20 to-transparent"
                  aria-hidden="true"
                />
                <p className="absolute bottom-3 left-3 right-3 text-[11px] font-medium leading-snug text-[var(--white)]/95 sm:bottom-4 sm:left-4 sm:text-xs">
                  {t('challenge.imageCaption')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}