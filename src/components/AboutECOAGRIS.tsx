'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { FaSeedling, FaLeaf } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const AboutECOAGRIS: React.FC = () => {
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white px-4 py-10 text-green-800 sm:px-8 sm:py-12 lg:px-12 lg:py-16"
    >
      <div className="container mx-auto flex flex-col items-center space-y-8 md:flex-row md:space-x-10 md:space-y-0 lg:space-x-12">
        
        {/* Left side (Image and Experience) */}
        <div className={`flex w-full justify-center md:w-1/2 ${reveal(0).className}`} style={reveal(0).style}>
          <div className="relative w-full max-w-md">
            <Image
              src="/about.jpg"
              alt="Team"
              className="h-auto w-full rounded-lg shadow-xl"
              width={500}
              height={400}
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:bottom-5 sm:left-5 sm:px-5 sm:text-base">
              {t('about.experience')}
            </div>
          </div>
        </div>

        {/* Right side (Text Content) */}
        <div className="w-full space-y-5 md:w-1/2 md:space-y-6">
          <h2 className={`text-center text-2xl font-bold leading-tight text-green-800 sm:text-3xl md:text-left lg:text-4xl ${reveal(100).className}`} style={reveal(100).style}>
            {t('about.title')}
          </h2>
          
          <p className={`text-center text-sm leading-relaxed text-gray-700 sm:text-base md:text-left lg:text-lg ${reveal(200).className}`} style={reveal(200).style}>
            {t('about.description')}
          </p>
          
          {/* Mission and Vision */}
          <div className="space-y-5 sm:space-y-6">
            {/* Mission */}
            <div className={`flex items-start gap-3 sm:gap-4 ${reveal(300).className}`} style={reveal(300).style}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-md sm:h-12 sm:w-12">
                <FaSeedling className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-green-700 sm:text-lg">
                  {t('about.missionTitle')}
                </h3>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm lg:text-base">
                  {t('about.mission')}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className={`flex items-start gap-3 sm:gap-4 ${reveal(450).className}`} style={reveal(450).style}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-white shadow-md sm:h-12 sm:w-12">
                <FaLeaf className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-green-700 sm:text-lg">
                  {t('about.visionTitle')}
                </h3>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm lg:text-base">
                  {t('about.vision')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className={`flex flex-wrap gap-3 pt-2 sm:gap-4 ${reveal(600).className}`} style={reveal(600).style}>
            <a
              href="tel:+2347040009930"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:px-6 sm:py-3 sm:text-base"
            >
              {t('about.callUs')}
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-green-800 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-600 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 sm:px-6 sm:py-3 sm:text-base"
            >
              {t('about.readMore')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutECOAGRIS;