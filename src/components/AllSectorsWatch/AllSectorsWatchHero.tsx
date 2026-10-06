'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // adjust path to your existing client

type Profile = {
  country: string | null;
  role?: string | null;
  is_admin?: boolean | null;
};

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

    // Check whether the current user is an active admin.
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

    // Non-admin users get coverage based on their profile country.
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

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0c1f1a] to-[#0a1a14] text-white"
      aria-labelledby="all-sectors-watch-heading"
    >
      {/* Subtle animated background layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 motion-safe:animate-[gradient-shift_18s_ease-in-out_infinite]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(34, 197, 94, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(14, 165, 233, 0.08), transparent), radial-gradient(ellipse 50% 30% at 60% 80%, rgba(16, 185, 129, 0.06), transparent)',
        }}
      />

      {/* Very subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft glow orbs */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-[float_12s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* LEFT — Content */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90 sm:text-xs">
              Ecoagris Intelligence
            </p>

            {/* Main heading */}
            <h1
              id="all-sectors-watch-heading"
              className="text-[clamp(1.875rem,5vw+0.5rem,4.5rem)] font-bold leading-[1.1] tracking-tight text-white"
            >
              All Sectors Watch
            </h1>

            {/* Supporting headline */}
            <p className="max-w-xl text-[clamp(1.125rem,2vw+0.5rem,1.5rem)] font-medium leading-snug text-emerald-100/90">
              One view. Multiple sectors. Smarter decisions.
            </p>

            {/* Description */}
            <p className="max-w-lg text-sm leading-relaxed text-slate-300/90 sm:text-base">
              Monitor key agricultural, livestock and other sector indicators
              from one intelligence platform, with data structured for clear
              analysis and informed decision-making.
            </p>

            {/* Information indicators */}
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {/* 1. Your Coverage */}
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/[0.07]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
                  Your Coverage
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                  {isLoading ? (
                    <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/10" />
                  ) : (
                    coverageLabel
                  )}
                </p>
              </div>

              {/* 2. Data Period */}
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/[0.07]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
                  Data Period
                </p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                  2006–2025
                </p>
              </div>

              {/* 3. Data Status */}
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/[0.07]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
                  Data Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
                  <span
                    className="relative flex h-2 w-2 shrink-0"
                    aria-hidden="true"
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live Data
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Decorative intelligence visual */}
          <div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            aria-hidden="true"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-sky-950/30 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm">
              {/* Abstract field lines */}
              <svg
                className="absolute inset-0 h-full w-full opacity-30"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Gentle contour / field curves */}
                <path
                  d="M0 180 Q80 140 160 160 T320 150 T400 170"
                  stroke="url(#grad1)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0 210 Q100 170 200 190 T400 200"
                  stroke="url(#grad1)"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M0 120 Q120 90 240 110 T400 100"
                  stroke="url(#grad2)"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.5"
                />
                {/* Vertical data axes suggestion */}
                <line x1="80" y1="40" x2="80" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="200" y1="40" x2="200" y2="260" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="320" y1="40" x2="320" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Soft data points */}
                <circle cx="120" cy="155" r="3" fill="#34d399" className="motion-safe:animate-[pulse-soft_4s_ease-in-out_infinite]" />
                <circle cx="220" cy="175" r="2.5" fill="#38bdf8" className="motion-safe:animate-[pulse-soft_5s_ease-in-out_infinite_0.5s]" />
                <circle cx="280" cy="140" r="3.5" fill="#34d399" className="motion-safe:animate-[pulse-soft_4.5s_ease-in-out_infinite_1s]" />
                <circle cx="160" cy="100" r="2" fill="#a7f3d0" opacity="0.8" />
                <circle cx="300" cy="190" r="2.5" fill="#7dd3fc" opacity="0.7" />

                {/* Subtle geographic / ECOWAS-inspired arc */}
                <path
                  d="M60 240 Q200 200 340 230"
                  stroke="rgba(52, 211, 153, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  fill="none"
                />

                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Soft inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-transparent" />

              {/* Small label inside visual */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300/80 backdrop-blur-sm">
                  Multi-sector intelligence
                </span>
                <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-medium text-slate-400 backdrop-blur-sm">
                  ECOWAS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes (add to global CSS or Tailwind config if preferred) */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[gradient-shift_18s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[float_12s_ease-in-out_infinite\\],
          .motion-safe\\:animate-\\[float_16s_ease-in-out_infinite_reverse\\],
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