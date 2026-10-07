'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export default function AllSectorsWatchHero() {
  const [coverageLabel, setCoverageLabel] = useState<string>('—');
  const [isLoading, setIsLoading] = useState(true);

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

        const { data: adminProfile, error: adminError } = await supabase
          .from('admin_profiles')
          .select('role, status')
          .eq('id', user.id)
          .maybeSingle();

        if (adminError) {
          console.error('Failed to check admin profile:', adminError);
        }

        const isAdmin =
          adminProfile?.status === 'active' &&
          (adminProfile.role === 'admin' ||
            adminProfile.role === 'super_admin');

        if (isAdmin) {
          if (mounted) {
            setCoverageLabel('ECOWAS Regional View');
            setIsLoading(false);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError || !profile) {
          if (mounted) {
            setCoverageLabel('—');
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setCoverageLabel(profile.country?.trim() || '—');
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
  }, []);

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--dark-green)] via-[#075b3d] to-[#0a3d2a] text-white"
      aria-labelledby="all-sectors-watch-heading"
    >
      {/* Soft brand light layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 15% 35%, rgba(250, 204, 21, 0.14), transparent 55%), radial-gradient(ellipse 70% 45% at 85% 15%, rgba(34, 197, 94, 0.18), transparent 50%), radial-gradient(ellipse 55% 40% at 70% 85%, rgba(190, 24, 93, 0.08), transparent 55%)',
        }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Floating glow orbs */}
      <div
        className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-[var(--yellow)]/15 blur-3xl motion-safe:animate-[float_12s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wine)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* LEFT — Content */}
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--yellow)]/25 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--yellow)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--yellow)] sm:text-xs">
                Ecoagris Intelligence
              </p>
            </div>

            <h1
              id="all-sectors-watch-heading"
              className="text-[clamp(1.9rem,5vw+0.5rem,4.4rem)] font-bold leading-[1.08] tracking-tight text-white"
            >
              All Sectors Watch
            </h1>

            <p className="max-w-xl text-[clamp(1.1rem,2vw+0.4rem,1.5rem)] font-medium leading-snug text-emerald-50/95">
              One view. Multiple sectors. Smarter decisions.
            </p>

            <p className="max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              Monitor key agricultural, livestock and other sector indicators
              from one intelligence platform, structured for clear analysis and
              informed decision-making across ECOWAS.
            </p>

            {/* Info cards */}
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/[0.14]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80 sm:text-[11px]">
                  Your Coverage
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                  {isLoading ? (
                    <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/15" />
                  ) : (
                    coverageLabel
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/[0.14]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80 sm:text-[11px]">
                  Data Period
                </p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                  2006–2025
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/[0.14]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80 sm:text-[11px]">
                  Data Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
                  <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--yellow)] opacity-50 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--yellow)]" />
                  </span>
                  Live Data
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Visual panel */}
          <div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            aria-hidden="true"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[var(--yellow)]/20 bg-gradient-to-br from-[var(--dark-green)] via-[#0b4a32] to-[#083826] shadow-2xl shadow-black/25">
              {/* Inner soft highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.16),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(52,211,153,0.14),transparent_45%)]" />

              <svg
                className="absolute inset-0 h-full w-full opacity-40"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 180 Q80 140 160 160 T320 150 T400 170"
                  stroke="url(#ecoGrad1)"
                  strokeWidth="1.8"
                  fill="none"
                />
                <path
                  d="M0 210 Q100 170 200 190 T400 200"
                  stroke="url(#ecoGrad1)"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.7"
                />
                <path
                  d="M0 120 Q120 90 240 110 T400 100"
                  stroke="url(#ecoGrad2)"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.6"
                />

                <line
                  x1="80"
                  y1="40"
                  x2="80"
                  y2="260"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                <line
                  x1="200"
                  y1="40"
                  x2="200"
                  y2="260"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <line
                  x1="320"
                  y1="40"
                  x2="320"
                  y2="260"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />

                <circle cx="120" cy="155" r="3.5" fill="#FACC15" />
                <circle cx="220" cy="175" r="3" fill="#6EE7B7" />
                <circle cx="280" cy="140" r="4" fill="#FACC15" />
                <circle cx="160" cy="100" r="2.5" fill="#A7F3D0" />
                <circle cx="300" cy="190" r="3" fill="#86EFAC" />

                <path
                  d="M60 240 Q200 200 340 230"
                  stroke="rgba(250, 204, 21, 0.35)"
                  strokeWidth="2"
                  strokeDasharray="5 7"
                  fill="none"
                />

                <defs>
                  <linearGradient id="ecoGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FACC15" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.35" />
                  </linearGradient>
                  <linearGradient id="ecoGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FACC15" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-green)]/85 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <span className="rounded-lg border border-[var(--yellow)]/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--yellow)] backdrop-blur-sm">
                  Multi-sector intelligence
                </span>
                <span className="rounded-lg border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-100/90 backdrop-blur-sm">
                  ECOWAS
                </span>
              </div>
            </div>

            {/* Decorative frame accent */}
            <div className="pointer-events-none absolute -inset-2 -z-10 rounded-[1.7rem] bg-gradient-to-br from-[var(--yellow)]/20 via-transparent to-emerald-300/10 blur-sm" />
          </div>
        </div>
      </div>

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
}