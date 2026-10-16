"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Insight {
  id: number;
  icon: string;
  value: string;
  label: string;
}

interface AggregateStats {
  improvedSeedUsePct: number | null;
  fertilizerKgPerHa: number | null;
  creditAccessPct: number | null;
  vaccinationCoveragePct: number | null;
  offtakeRatePct: number | null;
  dataCoveragePct: number | null;
}

const KeyDataInsight = () => {
  const { t } = useTranslation("common");
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AggregateStats | null>(null);

  const supabase = useMemo(() => createClient(), []);

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

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);

      try {
        const [inputsRes, livestockRes, countriesRes] = await Promise.all([
          supabase
            .from("agricultural_inputs")
            .select(
              "improved_seed_use_pct, fertilizer_kg_per_ha, credit_access_pct, country_id, year"
            ),
          supabase
            .from("livestock_data")
            .select(
              "vaccination_coverage_pct, offtake_rate_pct, country_id, year"
            ),
          supabase.from("countries").select("id"),
        ]);

        if (inputsRes.error) throw inputsRes.error;
        if (livestockRes.error) throw livestockRes.error;
        if (countriesRes.error) throw countriesRes.error;

        const inputs = inputsRes.data ?? [];
        const livestock = livestockRes.data ?? [];
        const totalCountries = (countriesRes.data ?? []).length;

        const avg = (values: (number | null | undefined)[]) => {
          const nums = values.filter(
            (v): v is number => typeof v === "number" && Number.isFinite(v)
          );
          if (nums.length === 0) return null;
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        };

        const coveredCountryIds = new Set<number>();
        inputs.forEach((r) => coveredCountryIds.add(r.country_id));
        livestock.forEach((r) => coveredCountryIds.add(r.country_id));

        const dataCoveragePct =
          totalCountries > 0
            ? (coveredCountryIds.size / totalCountries) * 100
            : null;

        setStats({
          improvedSeedUsePct: avg(
            inputs.map((r) => r.improved_seed_use_pct)
          ),
          fertilizerKgPerHa: avg(
            inputs.map((r) => r.fertilizer_kg_per_ha)
          ),
          creditAccessPct: avg(inputs.map((r) => r.credit_access_pct)),
          vaccinationCoveragePct: avg(
            livestock.map((r) => r.vaccination_coverage_pct)
          ),
          offtakeRatePct: avg(livestock.map((r) => r.offtake_rate_pct)),
          dataCoveragePct,
        });
      } catch (err) {
        console.error("Failed to load key data insights:", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchInsights();
  }, [supabase]);

  const formatPct = (value: number | null | undefined, digits = 0) => {
    if (value == null || !Number.isFinite(value)) return "—";
    return `${value.toFixed(digits)}%`;
  };

  const formatNumber = (value: number | null | undefined, digits = 1) => {
    if (value == null || !Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
    }).format(value);
  };

  const insights: Insight[] = [
    {
      id: 1,
      icon: "🌾",
      value: formatPct(stats?.improvedSeedUsePct),
      label: t("keyData.insights.cropYield", {
        defaultValue: "Avg. improved seed use",
      }),
    },
    {
      id: 2,
      icon: "💧",
      value: formatNumber(stats?.fertilizerKgPerHa),
      label: t("keyData.insights.irrigation", {
        defaultValue: "Avg. fertilizer (kg/ha)",
      }),
    },
    {
      id: 3,
      icon: "🚜",
      value: formatPct(stats?.creditAccessPct),
      label: t("keyData.insights.fertilizer", {
        defaultValue: "Avg. credit access",
      }),
    },
    {
      id: 4,
      icon: "🐄",
      value: formatPct(stats?.vaccinationCoveragePct),
      label: t("keyData.insights.trade", {
        defaultValue: "Avg. vaccination coverage",
      }),
    },
    {
      id: 5,
      icon: "📊",
      value: formatPct(stats?.dataCoveragePct),
      label: t("keyData.insights.dataCoverage", {
        defaultValue: "Countries with sector data",
      }),
    },
    {
      id: 6,
      icon: "🌱",
      value: formatPct(stats?.offtakeRatePct),
      label: t("keyData.insights.smartFarming", {
        defaultValue: "Avg. livestock offtake rate",
      }),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-green-200 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
    >
      <div className="absolute left-0 top-0 h-1.5 w-full bg-[var(--yellow)] sm:h-2" />

      <div className="mx-auto max-w-3xl px-2 text-center sm:px-4">
        <h2 className="mb-2 text-2xl font-bold text-[var(--medium-green)] sm:mb-3 sm:text-3xl md:text-4xl">
          {t("keyData.title")}
        </h2>
        <p className="text-sm text-gray-700 sm:text-base lg:text-lg">
          {t("keyData.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-8 grid w-[90%] max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-2xl p-5 text-center shadow-lg sm:p-6 ${
                  index % 2 === 0
                    ? "bg-[var(--medium-green)]/70"
                    : "bg-[var(--yellow)]/70"
                }`}
              >
                <div className="mx-auto mb-3 h-8 w-8 rounded bg-white/30" />
                <div className="mx-auto mb-2 h-8 w-16 rounded bg-white/40" />
                <div className="mx-auto h-4 w-28 rounded bg-white/30" />
              </div>
            ))
          : insights.map((insight, index) => (
              <Link
                key={insight.id}
                href="/login"
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dark-green)] focus-visible:ring-offset-2 rounded-2xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className={`cursor-pointer rounded-2xl p-5 text-center shadow-lg transition-all duration-500 hover:scale-105 sm:p-6 ${
                    index % 2 === 0
                      ? "bg-[var(--medium-green)] text-white"
                      : "bg-[var(--yellow)] text-[var(--dark-green)]"
                  }`}
                >
                  <div className="mb-2 text-3xl sm:mb-3 sm:text-4xl">
                    {insight.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold sm:text-3xl">
                    {insight.value}
                  </h3>
                  <p className="mt-1 text-sm font-medium sm:text-base">
                    {insight.label}
                  </p>
                </motion.div>
              </Link>
            ))}
      </div>

      <div className="mt-8 text-center sm:mt-10">
        <Link
          href="/login"
          className="inline-block rounded-full bg-[var(--medium-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[var(--olive-green)] sm:px-8 sm:py-3 sm:text-base"
        >
          {t("keyData.cta")}
        </Link>
      </div>
    </section>
  );
};

export default KeyDataInsight;