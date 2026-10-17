'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown } from 'lucide-react';
import RealDataCrossSectorSnapshot from '@/components/AllSectorsWatch/RealDataCrossSectorSnapshot';
import SimulatedCrossSectorSnapshot from '@/components/AllSectorsWatch/SimulatedCrossSectorSnapshot';

type DataMode = 'real' | 'simulated';

export default function AllSectorsWatchHero() {
  const { t } = useTranslation('common');
  const [coverageLabel, setCoverageLabel] = useState<string>('—');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedData, setSelectedData] = useState<DataMode>('real');
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) {
            setCoverageLabel('—');
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setCoverageLabel(t('allSectorsWatch.coverage.ecowas'));
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error('Failed to load coverage:', err);
        if (mounted) {
          setCoverageLabel('—');
          setIsLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    const show = () => {
      setShowScrollHint(true);
      return setTimeout(() => setShowScrollHint(false), 2500);
    };

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const firstTimer = setTimeout(() => {
      hideTimer = show();
    }, 1500);

    const interval = setInterval(() => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = show();
    }, 5000);

    return () => {
      clearTimeout(firstTimer);
      if (hideTimer) clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  const isValidated = selectedData === 'real';

  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--dark-green)] via-[#075b3d] to-[#0a3d2a] text-white"
        aria-labelledby="all-sectors-watch-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/Hero3.jpg')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 15% 35%, rgba(250, 204, 21, 0.12), transparent 55%), radial-gradient(ellipse 70% 45% at 85% 15%, rgba(34, 197, 94, 0.15), transparent 50%)',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 md:py-10 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-10 xl:gap-12">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--yellow)]/25 bg-white/10 px-3 py-1 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--yellow)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)] sm:text-xs">
                  {t('allSectorsWatch.badge')}
                </p>
              </div>

              <div>
                <h1
                  id="all-sectors-watch-heading"
                  className="text-[clamp(1.6rem,5vw+0.5rem,4.4rem)] font-bold leading-[1.1] tracking-tight text-white sm:leading-[1.08]"
                >
                  {t('allSectorsWatch.title')}
                </h1>
                <p className="max-w-xl text-[clamp(0.95rem,2vw+0.4rem,1.5rem)] font-medium leading-snug text-emerald-50/95">
                  {t('allSectorsWatch.tagline')}
                </p>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-white/80 sm:text-sm md:text-[15px]">
                  {t('allSectorsWatch.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80">
                    {t('allSectorsWatch.cards.coverage')}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] font-semibold text-white sm:text-sm">
                    {isLoading ? (
                      <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/15" />
                    ) : (
                      coverageLabel
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80">
                    {t('allSectorsWatch.cards.period')}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white sm:text-sm">
                    {t('allSectorsWatch.periodValue')}
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80">
                    {t('allSectorsWatch.cards.status')}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[13px] font-semibold text-white sm:text-sm">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:animate-none ${
                          isValidated ? 'bg-[var(--yellow)]' : 'bg-sky-400'
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          isValidated ? 'bg-[var(--yellow)]' : 'bg-sky-400'
                        }`}
                      />
                    </span>
                    {isValidated
                      ? t('allSectorsWatch.status.validated')
                      : t('allSectorsWatch.status.simulated')}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/60">
                    {isValidated
                      ? t('allSectorsWatch.status.validatedHint')
                      : t('allSectorsWatch.status.simulatedHint')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div
                className="mb-3 inline-flex w-full rounded-xl border border-white/20 bg-black/20 p-1 backdrop-blur-md"
                role="group"
                aria-label={t('allSectorsWatch.toggle.aria')}
              >
                <button
                  type="button"
                  onClick={() => setSelectedData('real')}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-[12px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] sm:px-4 sm:text-sm ${
                    selectedData === 'real'
                      ? 'bg-[var(--yellow)] text-[var(--dark-green)] shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t('allSectorsWatch.toggle.validated')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedData('simulated')}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-[12px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] sm:px-4 sm:text-sm ${
                    selectedData === 'simulated'
                      ? 'bg-[var(--yellow)] text-[var(--dark-green)] shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t('allSectorsWatch.toggle.simulated')}
                </button>
              </div>

              <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl border border-[var(--yellow)]/20 bg-gradient-to-br from-[var(--dark-green)] via-[#0b4a32] to-[#083826] shadow-2xl shadow-black/25">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.14),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(52,211,153,0.12),transparent_45%)]" />

                <div className="absolute inset-0 flex flex-col p-3 sm:p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100/90 sm:text-[11px]">
                      {t('allSectorsWatch.preview.label')}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isValidated
                          ? 'bg-[var(--yellow)]/20 text-[var(--yellow)]'
                          : 'bg-sky-400/20 text-sky-200'
                      }`}
                    >
                      {isValidated
                        ? t('allSectorsWatch.status.validated')
                        : t('allSectorsWatch.status.simulated')}
                    </span>
                  </div>

                  <div className="relative min-h-0 flex-1">
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 400 160"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.08)" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.08)" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.08)" />
                      <path
                        d={
                          isValidated
                            ? 'M0 120 Q50 110 80 95 T160 85 T240 70 T320 55 T400 40'
                            : 'M0 100 Q50 95 80 85 T160 80 T240 70 T320 75 T400 65'
                        }
                        stroke={isValidated ? '#FACC15' : '#38BDF8'}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d={
                          isValidated
                            ? 'M0 140 Q80 130 160 128 T320 120 T400 115'
                            : 'M0 130 Q80 125 160 118 T320 128 T400 122'
                        }
                        stroke={isValidated ? '#6EE7B7' : '#7DD3FC'}
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.7"
                        strokeLinecap="round"
                      />
                      {(isValidated
                        ? [[80, 95], [160, 85], [240, 70], [320, 55]]
                        : [[80, 85], [160, 80], [240, 70], [320, 75]]
                      ).map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill={isValidated ? '#FACC15' : '#38BDF8'}
                        />
                      ))}
                    </svg>
                  </div>

                  <p className="mt-1 text-[10px] leading-snug text-white/65 sm:text-[11px]">
                    {isValidated
                      ? t('allSectorsWatch.preview.validatedNote')
                      : t('allSectorsWatch.preview.simulatedNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 transition-all duration-500 sm:bottom-4 ${
            showScrollHint ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
          aria-hidden={!showScrollHint}
        >
          <p className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md sm:text-xs">
            {t('allSectorsWatch.scrollHint')}
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/35 backdrop-blur-md">
            <ChevronDown className="h-5 w-5 animate-bounce text-[var(--yellow)] motion-reduce:animate-none" />
          </div>
        </div>
      </section>

      {selectedData === 'real' && <RealDataCrossSectorSnapshot />}
      {selectedData === 'simulated' && <SimulatedCrossSectorSnapshot />}
    </>
  );
}