'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from "next/link";

const HeroSection: React.FC = () => {
  const { t } = useTranslation('common');
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ Define slides with static translation keys
  const slides = [
    'agricInput',
    'agroHydro',
    'agricProduction',
    'agricMarket',
    'foodStocks',
    'nutrition',
    'livestock',
    'fishery',
    'aquaculture',
    'research',
    'macro'
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative flex min-h-[300px] flex-col items-center justify-center bg-[var(--medium-green)] px-4 py-10 text-white sm:min-h-[450px] sm:px-8 lg:min-h-[500px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/Hero.jpg"
          alt="Agriculture in ECOWAS"
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center text-center">
        {/* Headline */}
        <h1 className="mb-2 text-2xl font-bold sm:mb-3 sm:text-4xl md:text-5xl lg:text-6xl">
          {t('hero.headline')}
        </h1>

        {/* Subheadline */}
        <p className="mb-4 text-sm sm:mb-6 sm:text-lg md:text-xl">
          {t('hero.subheadline')}
        </p>

        {/* CTA Button */}
        <div className="mb-8 text-center sm:mb-10">
          <Link 
            href="/login"
            className="inline-block rounded-lg bg-[var(--yellow)] px-6 py-2.5 text-sm font-semibold text-[var(--dark-green)] transition hover:bg-[var(--yellow)] focus:outline-none focus:ring-2 focus:ring-[var(--white)] sm:px-8 sm:py-3 sm:text-base"
          >
            {t('hero.cta')}
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative w-full max-w-3xl overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((key) => (
              <div
                key={key}
                className="min-w-full px-4 py-2 text-center text-[var(--white)]"
              >
                <h2 className="mb-1 text-lg font-bold sm:mb-2 sm:text-2xl">
                  {t(`hero.slides.${key}.title`)}
                </h2>
                <p className="text-xs font-semibold sm:text-base">
                  {t(`hero.slides.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;