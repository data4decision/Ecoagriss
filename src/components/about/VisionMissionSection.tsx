// components/about/VisionMissionSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const VISION_TEXT =
  'To become a trusted regional gateway for agricultural data and intelligence across West Africa, enabling better evidence, stronger collaboration and more informed decisions for sustainable agricultural development.';

const MISSION_TEXT =
  'To converge credible agricultural data from across West Africa, make it accessible in usable formats, and transform it into meaningful intelligence that supports research, policy, investment and sustainable agricultural development.';

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function VisionMissionSection() {
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = (delayMs = 0) => ({
    className: `transition-all duration-700 ease-out motion-reduce:transition-none ${
      isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-5 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
    }`,
    style: { transitionDelay: isVisible ? `${delayMs}ms` : '0ms' },
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[350px] w-full items-center justify-center overflow-hidden bg-[var(--green)] py-8 sm:py-12"
      aria-labelledby="vision-mission-heading"
    >
      {/* ============================================================ */}
      {/* Background Decorations (Dashed Lines)                         */}
      {/* ============================================================ */}
      
      {/* Top Left Dashed Circles */}
      <svg
        className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 text-white/30 sm:h-72 sm:w-72"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="40" cy="40" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
        <circle cx="40" cy="40" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 10" />
        <circle cx="40" cy="40" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="2 12" />
      </svg>

      {/* ============================================================ */}
      {/* Main Content Container                                        */}
      {/* ============================================================ */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Inner White Base */}
        <div className="relative w-full rounded-2xl bg-[var(--white)] pt-0 shadow-[0_15px_35px_rgba(0,0,0,0.15)]">
          
          {/* Green Top Section containing the cards */}
          <div className="relative z-10 -mt-6 flex flex-col rounded-t-2xl bg-[var(--dark-green)] px-4 pb-16 pt-8 sm:-mt-8 sm:px-8 sm:pb-24 sm:pt-10 md:px-12">
            
            {/* Grid for Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              
              {/* --- VISION CARD --- */}
              <div
                className={`flex flex-col rounded-lg bg-[var(--green)] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] sm:p-6 ${reveal(0).className}`}
                style={reveal(0).style}
              >
                <h2
                  id="vision-mission-heading"
                  className="text-center text-xl font-bold uppercase tracking-wider text-[var(--white)] sm:text-2xl"
                >
                  Our Vision
                </h2>
                <div className="mx-auto mt-3 mb-4 h-px w-16 bg-[var(--yellow)] sm:mt-4 sm:mb-5" aria-hidden="true" />
                <p className="text-center text-sm leading-relaxed text-[var(--white)]/95 sm:text-base sm:leading-loose">
                  {VISION_TEXT}
                </p>
              </div>

              {/* --- MISSION CARD --- */}
              <div
                className={`flex flex-col rounded-lg bg-[var(--green)] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] sm:p-6 ${reveal(150).className}`}
                style={reveal(150).style}
              >
                <h2 className="text-center text-xl font-bold uppercase tracking-wider text-[var(--white)] sm:text-2xl">
                  Our Mission
                </h2>
                <div className="mx-auto mt-3 mb-4 h-px w-16 bg-[var(--yellow)] sm:mt-4 sm:mb-5" aria-hidden="true" />
                <p className="text-center text-sm leading-relaxed text-[var(--white)]/95 sm:text-base sm:leading-loose">
                  {MISSION_TEXT}
                </p>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* Curved Green Bottom Edge (Overlays the white base)            */}
          {/* ============================================================ */}
          <div className="absolute left-0 right-0 top-[calc(100%-4rem)] z-0 leading-[0] sm:top-[calc(100%-6rem)]" aria-hidden="true">
            <svg
              className="block w-full"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,0 L1440,0 L1440,10 C1080,80 360,80 0,10 Z"
                fill="var(--dark-green)"
              />
            </svg>
          </div>

          {/* ============================================================ */}
          {/* Lower White Section (Reduced breathing room)                  */}
          {/* ============================================================ */}
          <div className="relative z-20 h-12 w-full sm:h-16" />

        </div>
      </div>
    </section>
  );
}