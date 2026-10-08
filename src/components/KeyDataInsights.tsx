"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface Insight {
  id: number;
  icon: string;
  value: string;
  label: string;
}

const KeyDataInsight = () => {
  const { t } = useTranslation("common");
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

  const insights: Insight[] = [
    { id: 1, icon: "🌾", value: "65%", label: t("keyData.insights.cropYield") },
    { id: 2, icon: "💧", value: "42%", label: t("keyData.insights.irrigation") },
    { id: 3, icon: "🚜", value: "28%", label: t("keyData.insights.fertilizer") },
    { id: 4, icon: "🌍", value: "15%", label: t("keyData.insights.trade") },
    { id: 5, icon: "📊", value: "78%", label: t("keyData.insights.dataCoverage") },
    { id: 6, icon: "🌱", value: "60%", label: t("keyData.insights.smartFarming") },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-green-200 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
    >
      {/* Top yellow accent bar */}
      <div className="absolute left-0 top-0 h-1.5 w-full bg-[var(--yellow)] sm:h-2"></div>

      <div className="mx-auto max-w-3xl px-2 text-center sm:px-4">
        <h2 className="mb-2 text-2xl font-bold text-[var(--medium-green)] sm:mb-3 sm:text-3xl md:text-4xl">
          {t("keyData.title")}
        </h2>
        <p className="text-sm text-gray-700 sm:text-base lg:text-lg">
          {t("keyData.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-8 grid w-[90%] max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className={`rounded-2xl p-5 text-center shadow-lg transition-all duration-500 hover:scale-105 sm:p-6 ${
              index % 2 === 0
                ? "bg-[var(--medium-green)] text-white"
                : "bg-[var(--yellow)] text-[var(--dark-green)]"
            }`}
          >
            <div className="mb-2 text-3xl sm:mb-3 sm:text-4xl">{insight.icon}</div>
            <h3 className="text-2xl font-extrabold sm:text-3xl">{insight.value}</h3>
            <p className="mt-1 text-sm font-medium sm:text-base">{insight.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center sm:mt-10">
        <Link
          href="/country-data"
          className="inline-block rounded-full bg-[var(--medium-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[var(--olive-green)] sm:px-8 sm:py-3 sm:text-base"
        >
          {t("keyData.cta")}
        </Link>
      </div>
    </section>
  );
};

export default KeyDataInsight;