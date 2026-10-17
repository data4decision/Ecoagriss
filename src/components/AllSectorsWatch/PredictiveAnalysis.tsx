'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  BarChart3,
  LineChart as LineChartIcon,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import type { SectorExplorerFilters } from './SectorComparisonTrend';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

type ChartType = 'line' | 'bar';
type Horizon = 3 | 5;

interface AiBriefing {
  summary: string;
  keySignals: string[];
  attention: string;
  outlook: string;
}

interface VariableDefinition {
  key: string;
  label: string;
  unit: string;
}

interface DataRecord {
  id: number;
  country_id: number;
  year: number;
  [key: string]: unknown;
}

interface Country {
  id: number;
  name: string;
}

interface ChartRow {
  year: number;
  isForecast?: boolean;
  [key: string]: number | string | boolean | null | undefined;
}

interface ForecastMetric {
  label: string;
  value: string;
  sub?: string;
}

interface PredictiveAnalysisProps {
  filters: SectorExplorerFilters;
}

/* ─────────────────────────────────────────────
   Constants (keys only — labels from i18n)
───────────────────────────────────────────── */

const AGRICULTURAL_INPUT_VARIABLE_KEYS = [
  { key: 'cereal_seeds_tons', unitKey: 'tons' },
  { key: 'fertilizer_tons', unitKey: 'tons' },
  { key: 'pesticide_liters', unitKey: 'litres' },
  { key: 'improved_seed_use_pct', unitKey: 'pct' },
  { key: 'fertilizer_kg_per_ha', unitKey: 'kgHa' },
  { key: 'input_price_index_2006_base', unitKey: 'base2006' },
  { key: 'agro_dealer_count', unitKey: 'count' },
  { key: 'input_subsidy_budget_usd', unitKey: 'usd' },
  { key: 'distribution_timeliness_pct', unitKey: 'pct' },
  { key: 'stockouts_days_per_year', unitKey: 'daysYear' },
  { key: 'input_import_value_usd', unitKey: 'usd' },
  { key: 'local_production_inputs_tons', unitKey: 'tons' },
  { key: 'mechanization_units_per_1000_farms', unitKey: 'unitsPer1000Farms' },
  { key: 'credit_access_pct', unitKey: 'pct' },
] as const;

const LIVESTOCK_VARIABLE_KEYS = [
  { key: 'cattle_head', unitKey: 'head' },
  { key: 'small_ruminants_head', unitKey: 'head' },
  { key: 'pigs_head', unitKey: 'head' },
  { key: 'poultry_head', unitKey: 'head' },
  { key: 'milk_production_tons', unitKey: 'tons' },
  { key: 'meat_production_tons', unitKey: 'tons' },
  { key: 'livestock_price_index_2006_base', unitKey: 'base2006' },
  { key: 'vaccination_coverage_pct', unitKey: 'pct' },
  { key: 'fmd_incidents_count', unitKey: 'count' },
  { key: 'grazing_area_ha', unitKey: 'ha' },
  { key: 'transhumance_events', unitKey: 'count' },
  { key: 'veterinary_facilities_count', unitKey: 'count' },
  { key: 'feed_imports_tons', unitKey: 'tons' },
  { key: 'local_feed_production_tons', unitKey: 'tons' },
  { key: 'livestock_exports_tons', unitKey: 'tons' },
  { key: 'offtake_rate_pct', unitKey: 'pct' },
] as const;

const CHART_COLORS = [
  '#0B6B3A',
  '#F47B20',
  '#2563EB',
  '#9333EA',
  '#DC2626',
  '#0891B2',
  '#CA8A04',
  '#4F46E5',
  '#059669',
  '#DB2777',
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function getVariableKeysForSector(
  sector: SectorExplorerFilters['sector']
): readonly { key: string; unitKey: string }[] {
  return sector === 'agricultural_inputs'
    ? AGRICULTURAL_INPUT_VARIABLE_KEYS
    : LIVESTOCK_VARIABLE_KEYS;
}

function isNumericValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatValue(value: unknown, locale: string): string {
  if (!isNumericValue(value)) return '—';
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
}

function buildYTicks(
  data: ChartRow[],
  seriesKeys: string[]
): number[] {
  let max = 0;

  data.forEach((row) => {
    seriesKeys.forEach((key) => {
      const value = row[key];
      if (typeof value === 'number' && Number.isFinite(value) && value > max) {
        max = value;
      }
    });
  });

  const step = 10_000;
  const paddedMax = max * 1.1;
  const top = Math.max(step, Math.ceil(paddedMax / step) * step);

  const ticks: number[] = [];
  for (let t = 0; t <= top; t += step) {
    ticks.push(t);
  }

  return ticks;
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function forecastSeries(
  points: { year: number; value: number }[],
  horizon: number
): { year: number; value: number }[] {
  if (points.length < 2) return [];

  const n = points.length;
  const xs = points.map((p) => p.year);
  const ys = points.map((p) => p.value);

  const xMean = average(xs);
  const yMean = average(ys);

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  const lastYear = xs[xs.length - 1];
  const result: { year: number; value: number }[] = [];

  for (let i = 1; i <= horizon; i++) {
    const year = lastYear + i;
    const value = Math.max(0, intercept + slope * year);
    result.push({ year, value });
  }

  return result;
}

function growthRate(points: { value: number }[]): number {
  if (points.length < 2) return 0;
  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (first === 0) return 0;
  const years = points.length - 1;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */

export default function PredictiveAnalysis({
  filters,
}: PredictiveAnalysisProps) {
  const { t, i18n } = useTranslation('common');

  /** Normalized for API: en | fr | pt */
  const apiLocale = useMemo(() => {
    const base = (i18n.language || 'en').toLowerCase().split('-')[0];
    if (base === 'fr' || base === 'pt') return base;
    return 'en';
  }, [i18n.language]);

  /** Full locale for number formatting */
  const numberLocale = i18n.language || 'en';

  const supabase = useMemo(() => createClient(), []);

  const [chartType, setChartType] = useState<ChartType>('line');
  const [horizon, setHorizon] = useState<Horizon>(3);

  const [countries, setCountries] = useState<Country[]>([]);
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<ForecastMetric[]>([]);
  const [direction, setDirection] = useState<
    'Rising' | 'Stable' | 'Declining'
  >('Stable');

  const [aiBriefing, setAiBriefing] = useState<AiBriefing | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const availableVariables = useMemo((): VariableDefinition[] => {
    return getVariableKeysForSector(filters.sector).map((v) => ({
      key: v.key,
      label: t(`predictiveAnalysis.variables.${v.key}`),
      unit: t(`predictiveAnalysis.units.${v.unitKey}`),
    }));
  }, [filters.sector, t]);

  const countryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    countries.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [countries]);

  const sectorLabel = t(`predictiveAnalysis.sectors.${filters.sector}`);

  const sectorLabelEn =
    filters.sector === 'agricultural_inputs'
      ? 'Agricultural Inputs'
      : 'Livestock';

  useEffect(() => {
    let mounted = true;

    async function loadCountries() {
      const { data, error: err } = await supabase
        .from('countries')
        .select('id, name')
        .order('name', { ascending: true });

      if (!mounted) return;
      if (err) {
        console.error(err);
        return;
      }
      setCountries((data ?? []) as Country[]);
    }

    void loadCountries();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const loadAndForecast = useCallback(async () => {
    if (
      filters.countryIds.length === 0 ||
      filters.variables.length === 0
    ) {
      setChartData([]);
      setMetrics([]);
      setAiBriefing(null);
      setAiError(null);
      return;
    }

    if (countries.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setAiBriefing(null);
    setAiError(null);

    try {
      const tableName =
        filters.sector === 'agricultural_inputs'
          ? 'agricultural_inputs'
          : 'livestock_data';

      const selectedColumns = [
        'id',
        'country_id',
        'year',
        ...filters.variables,
      ].join(', ');

      const { data, error: queryError } = await supabase
        .from(tableName)
        .select(selectedColumns)
        .in('country_id', filters.countryIds)
        .gte('year', filters.startYear)
        .lte('year', filters.endYear)
        .order('year', { ascending: true });

      if (queryError) throw queryError;

      const records = (data ?? []) as unknown as DataRecord[];

      const rowsMap = new Map<number, ChartRow>();

      records.forEach((record) => {
        const year = record.year;
        if (!rowsMap.has(year)) {
          rowsMap.set(year, { year, isForecast: false });
        }
        const row = rowsMap.get(year)!;

        filters.variables.forEach((variableKey) => {
          const value = record[variableKey];
          if (!isNumericValue(value)) return;
          const seriesKey = `${record.country_id}_${variableKey}`;
          row[seriesKey] = value;
        });
      });

      const historicalRows = Array.from(rowsMap.values()).sort(
        (a, b) => a.year - b.year
      );

      if (historicalRows.length === 0) {
        setChartData([]);
        setMetrics([]);
        setAiBriefing(null);
        setAiError(t('predictiveAnalysis.errors.notEnoughHistorical'));
        setLoading(false);
        return;
      }

      const lastHistoricalYear =
        historicalRows[historicalRows.length - 1].year as number;

      const forecastRowsMap = new Map<number, ChartRow>();
      const growthRates: number[] = [];
      const endProjections: number[] = [];

      filters.countryIds.forEach((countryId) => {
        filters.variables.forEach((variableKey) => {
          const seriesKey = `${countryId}_${variableKey}`;

          const points: { year: number; value: number }[] = [];
          historicalRows.forEach((row) => {
            const v = row[seriesKey];
            if (isNumericValue(v)) {
              points.push({ year: row.year as number, value: v });
            }
          });

          if (points.length < 2) return;

          growthRates.push(growthRate(points));

          const forecasted = forecastSeries(points, horizon);

          forecasted.forEach(({ year, value }) => {
            if (!forecastRowsMap.has(year)) {
              forecastRowsMap.set(year, { year, isForecast: true });
            }
            const fRow = forecastRowsMap.get(year)!;
            fRow[seriesKey] = value;

            if (year === lastHistoricalYear + horizon) {
              endProjections.push(value);
            }
          });
        });
      });

      const forecastRows = Array.from(forecastRowsMap.values()).sort(
        (a, b) => a.year - b.year
      );

      const combined = [...historicalRows, ...forecastRows];
      setChartData(combined);

      const avgGrowth = average(growthRates);
      const absGrowth = Math.abs(avgGrowth);
      const dir: 'Rising' | 'Stable' | 'Declining' =
        absGrowth < 0.5 ? 'Stable' : avgGrowth > 0 ? 'Rising' : 'Declining';
      setDirection(dir);

      const endYear = lastHistoricalYear + horizon;
      const projectedSummary =
        endProjections.length > 0
          ? formatValue(average(endProjections), numberLocale)
          : '—';

      const confidenceKey =
        historicalRows.length >= 10
          ? 'mediumHigh'
          : historicalRows.length >= 5
            ? 'medium'
            : 'low';

      setMetrics([
        {
          label: t('predictiveAnalysis.metrics.projected', { year: endYear }),
          value: projectedSummary,
          sub: t('predictiveAnalysis.metrics.projectedSub'),
        },
        {
          label: t('predictiveAnalysis.metrics.avgAnnualGrowth'),
          value: `${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
          sub: t('predictiveAnalysis.metrics.avgAnnualGrowthSub'),
        },
        {
          label: t('predictiveAnalysis.metrics.direction'),
          value: t(`predictiveAnalysis.direction.${dir}`),
          sub: t('predictiveAnalysis.metrics.directionSub', { horizon }),
        },
        {
          label: t('predictiveAnalysis.metrics.confidence'),
          value: t(`predictiveAnalysis.confidence.${confidenceKey}`),
          sub: t('predictiveAnalysis.metrics.confidenceSub'),
        },
      ]);

      setLoading(false);

      const seriesPayload: Array<{
        country: string;
        indicator: string;
        unit: string;
        performance: 'higher_is_better' | 'lower_is_better' | 'neutral';
        historical: { year: number; value: number }[];
        forecast: { year: number; value: number }[];
        analysis: {
          lastHistoricalYear: number;
          lastHistoricalValue: number;
          forecastEndYear: number;
          forecastEndValue: number;
          historicalAvgAnnualGrowthPercent: number | null;
          projectedChangePercent: number | null;
          direction: 'rising' | 'stable' | 'declining';
          model: 'linear_trend';
        };
      }> = [];

      const enVariableLabels: Record<string, string> = {
        cereal_seeds_tons: 'Cereal Seeds',
        fertilizer_tons: 'Fertilizer',
        pesticide_liters: 'Pesticide',
        improved_seed_use_pct: 'Improved Seed Use',
        fertilizer_kg_per_ha: 'Fertilizer',
        input_price_index_2006_base: 'Input Price Index',
        agro_dealer_count: 'Agro-dealer Count',
        input_subsidy_budget_usd: 'Input Subsidy Budget',
        distribution_timeliness_pct: 'Distribution Timeliness',
        stockouts_days_per_year: 'Stockouts',
        input_import_value_usd: 'Input Import Value',
        local_production_inputs_tons: 'Local Input Production',
        mechanization_units_per_1000_farms: 'Mechanization',
        credit_access_pct: 'Credit Access',
        cattle_head: 'Cattle Population',
        small_ruminants_head: 'Small Ruminants',
        pigs_head: 'Pig Population',
        poultry_head: 'Poultry Population',
        milk_production_tons: 'Milk Production',
        meat_production_tons: 'Meat Production',
        livestock_price_index_2006_base: 'Livestock Price Index',
        vaccination_coverage_pct: 'Vaccination Coverage',
        fmd_incidents_count: 'FMD Incidents',
        grazing_area_ha: 'Grazing Area',
        transhumance_events: 'Transhumance Events',
        veterinary_facilities_count: 'Veterinary Facilities',
        feed_imports_tons: 'Feed Imports',
        local_feed_production_tons: 'Local Feed Production',
        livestock_exports_tons: 'Livestock Exports',
        offtake_rate_pct: 'Offtake Rate',
      };

      const enUnits: Record<string, string> = {
        cereal_seeds_tons: 'tons',
        fertilizer_tons: 'tons',
        pesticide_liters: 'litres',
        improved_seed_use_pct: '%',
        fertilizer_kg_per_ha: 'kg/ha',
        input_price_index_2006_base: '2006 base',
        agro_dealer_count: 'count',
        input_subsidy_budget_usd: 'USD',
        distribution_timeliness_pct: '%',
        stockouts_days_per_year: 'days/year',
        input_import_value_usd: 'USD',
        local_production_inputs_tons: 'tons',
        mechanization_units_per_1000_farms: 'units/1,000 farms',
        credit_access_pct: '%',
        cattle_head: 'head',
        small_ruminants_head: 'head',
        pigs_head: 'head',
        poultry_head: 'head',
        milk_production_tons: 'tons',
        meat_production_tons: 'tons',
        livestock_price_index_2006_base: '2006 base',
        vaccination_coverage_pct: '%',
        fmd_incidents_count: 'count',
        grazing_area_ha: 'ha',
        transhumance_events: 'count',
        veterinary_facilities_count: 'count',
        feed_imports_tons: 'tons',
        local_feed_production_tons: 'tons',
        livestock_exports_tons: 'tons',
        offtake_rate_pct: '%',
      };

      for (const countryId of filters.countryIds) {
        const countryName =
          countryNameMap.get(countryId) ??
          t('predictiveAnalysis.countryFallback', { id: countryId });

        for (const variableKey of filters.variables) {
          const variable = availableVariables.find(
            (v) => v.key === variableKey
          );
          if (!variable) continue;

          const seriesKey = `${countryId}_${variableKey}`;

          const historical: { year: number; value: number }[] = [];
          historicalRows.forEach((row) => {
            const v = row[seriesKey];
            if (isNumericValue(v)) {
              historical.push({
                year: row.year as number,
                value: v,
              });
            }
          });

          if (historical.length < 2) continue;

          const forecastPts: { year: number; value: number }[] = [];
          forecastRows.forEach((row) => {
            const v = row[seriesKey];
            if (isNumericValue(v)) {
              forecastPts.push({
                year: row.year as number,
                value: v,
              });
            }
          });

          if (forecastPts.length === 0) continue;

          const lastH = historical[historical.length - 1];
          const lastF = forecastPts[forecastPts.length - 1];
          const g = growthRate(historical);
          const projectedChange =
            lastH.value === 0
              ? null
              : ((lastF.value - lastH.value) / lastH.value) * 100;

          const seriesDir: 'rising' | 'stable' | 'declining' =
            Math.abs(g) < 0.5 ? 'stable' : g > 0 ? 'rising' : 'declining';

          seriesPayload.push({
            country: countryName,
            indicator: enVariableLabels[variableKey] ?? variable.label,
            unit: enUnits[variableKey] ?? variable.unit,
            performance: 'neutral',
            historical,
            forecast: forecastPts,
            analysis: {
              lastHistoricalYear: lastH.year,
              lastHistoricalValue: lastH.value,
              forecastEndYear: lastF.year,
              forecastEndValue: lastF.value,
              historicalAvgAnnualGrowthPercent: g,
              projectedChangePercent: projectedChange,
              direction: seriesDir,
              model: 'linear_trend',
            },
          });
        }
      }

      if (seriesPayload.length === 0) {
        setAiError(t('predictiveAnalysis.errors.notEnoughSeries'));
        return;
      }

      setAiLoading(true);

      try {
        const res = await fetch('/api/predictive-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sector: sectorLabelEn,
            historicalPeriod: `${filters.startYear}–${filters.endYear}`,
            forecastHorizonYears: horizon,
            countries: filters.countryIds.map(
              (id) =>
                countryNameMap.get(id) ??
                t('predictiveAnalysis.countryFallback', { id })
            ),
            variables: filters.variables.map(
              (k) => enVariableLabels[k] ?? k
            ),
            series: seriesPayload,
            overall: {
              direction:
                absGrowth < 0.5
                  ? 'stable'
                  : avgGrowth > 0
                    ? 'rising'
                    : 'declining',
              avgProjectedGrowthPercent:
                growthRates.length > 0 ? avgGrowth : null,
              confidence:
                confidenceKey === 'mediumHigh'
                  ? 'medium_high'
                  : confidenceKey,
            },
            locale: apiLocale,
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            typeof json.error === 'string'
              ? json.error
              : t('predictiveAnalysis.errors.aiRequestFailed')
          );
        }

        setAiBriefing({
          summary: json.summary,
          keySignals: Array.isArray(json.keySignals)
            ? json.keySignals
            : [],
          attention: json.attention,
          outlook: json.outlook,
        });
      } catch (aiErr) {
        setAiBriefing(null);
        setAiError(
          aiErr instanceof Error
            ? aiErr.message
            : t('predictiveAnalysis.errors.unableAi')
        );
      } finally {
        setAiLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('predictiveAnalysis.errors.unableForecast');
      setError(message);
      setChartData([]);
      setMetrics([]);
      setAiBriefing(null);
      setLoading(false);
      setAiLoading(false);
    }
  }, [
    filters,
    horizon,
    supabase,
    availableVariables,
    countryNameMap,
    sectorLabelEn,
    countries.length,
    t,
    numberLocale,
    apiLocale,
  ]);

  useEffect(() => {
    void loadAndForecast();
  }, [loadAndForecast]);

  const chartSeries = useMemo(() => {
    const series: Array<{
      dataKey: string;
      name: string;
      color: string;
    }> = [];

    let colorIndex = 0;

    filters.countryIds.forEach((countryId) => {
      const countryName =
        countryNameMap.get(countryId) ??
        t('predictiveAnalysis.countryFallback', { id: countryId });

      filters.variables.forEach((variableKey) => {
        const variable = availableVariables.find(
          (v) => v.key === variableKey
        );
        if (!variable) return;

        series.push({
          dataKey: `${countryId}_${variableKey}`,
          name: t('predictiveAnalysis.seriesName', {
            country: countryName,
            indicator: variable.label,
          }),
          color: CHART_COLORS[colorIndex % CHART_COLORS.length],
        });
        colorIndex += 1;
      });
    });

    return series;
  }, [
    filters.countryIds,
    filters.variables,
    countryNameMap,
    availableVariables,
    t,
  ]);

  const yTicks = useMemo(
    () =>
      buildYTicks(
        chartData,
        chartSeries.map((s) => s.dataKey)
      ),
    [chartData, chartSeries]
  );

  const lastHistoricalYear = useMemo(() => {
    const historical = chartData.filter((r) => !r.isForecast);
    if (historical.length === 0) return null;
    return historical[historical.length - 1].year as number;
  }, [chartData]);

  const directionMetricLabel = t('predictiveAnalysis.metrics.direction');

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[var(--dark-green)] via-[#005f00] to-[#003d00] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--yellow)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-green-100">
                {t('predictiveAnalysis.badge')}
              </span>
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {t('predictiveAnalysis.title')}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-green-50">
              {t('predictiveAnalysis.subtitle', { horizon })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              {t('predictiveAnalysis.horizon')}
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
              {([3, 5] as Horizon[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    horizon === h
                      ? 'bg-[var(--dark-green)] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('predictiveAnalysis.years', { count: h })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              {t('predictiveAnalysis.chart')}
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  chartType === 'line'
                    ? 'bg-[var(--yellow)] text-[var(--dark-green)]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LineChartIcon className="h-3.5 w-3.5" />
                {t('predictiveAnalysis.line')}
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  chartType === 'bar'
                    ? 'bg-[var(--yellow)] text-[var(--dark-green)]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {t('predictiveAnalysis.bar')}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {t('predictiveAnalysis.sectorSummary', {
            sector: sectorLabel,
            count: filters.countryIds.length,
          })}
          {' · '}
          {t('predictiveAnalysis.variableSummary', {
            count: filters.variables.length,
          })}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('predictiveAnalysis.buildingForecast')}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <div>
              <p className="font-semibold text-gray-700">
                {t('predictiveAnalysis.noForecastTitle')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {t('predictiveAnalysis.noForecastDescription')}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {t('predictiveAnalysis.forecastTitle', {
                    sector: sectorLabel,
                  })}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('predictiveAnalysis.forecastLegend')}
                  {lastHistoricalYear != null && (
                    <>
                      {' '}
                      {t('predictiveAnalysis.splitAt', {
                        year: lastHistoricalYear,
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis
                      ticks={yTicks}
                      domain={[0, yTicks[yTicks.length - 1] ?? 'auto']}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                      width={55}
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat(numberLocale, {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(v)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        formatValue(value, numberLocale),
                        String(name),
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    />
                    {lastHistoricalYear != null && (
                      <ReferenceLine
                        x={lastHistoricalYear}
                        stroke="#9CA3AF"
                        strokeDasharray="4 4"
                        label={{
                          value: t('predictiveAnalysis.forecastArrow'),
                          position: 'insideTopRight',
                          fill: '#6B7280',
                          fontSize: 11,
                        }}
                      />
                    )}
                    {chartSeries.map((s) => (
                      <Line
                        key={s.dataKey}
                        type="monotone"
                        dataKey={s.dataKey}
                        name={s.name}
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis
                      ticks={yTicks}
                      domain={[0, yTicks[yTicks.length - 1] ?? 'auto']}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                      width={55}
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat(numberLocale, {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(v)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        formatValue(value, numberLocale),
                        String(name),
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    />
                    {lastHistoricalYear != null && (
                      <ReferenceLine
                        x={lastHistoricalYear}
                        stroke="#9CA3AF"
                        strokeDasharray="4 4"
                      />
                    )}
                    {chartSeries.map((s) => (
                      <Bar
                        key={s.dataKey}
                        dataKey={s.dataKey}
                        name={s.name}
                        fill={s.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    {m.label}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-gray-900">
                    {m.label === directionMetricLabel &&
                      direction === 'Rising' && (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      )}
                    {m.label === directionMetricLabel &&
                      direction === 'Declining' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    {m.label === directionMetricLabel &&
                      direction === 'Stable' && (
                        <Minus className="h-4 w-4 text-gray-500" />
                      )}
                    {m.value}
                  </p>
                  {m.sub && (
                    <p className="mt-0.5 text-xs text-gray-400">{m.sub}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t('predictiveAnalysis.aiInterpretation')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t('predictiveAnalysis.aiInterpretationSub')}
                  </p>
                </div>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('predictiveAnalysis.generatingInterpretation')}
                </div>
              )}

              {aiError && !aiLoading && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {aiError}
                </div>
              )}

              {aiBriefing && !aiLoading && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      {t('predictiveAnalysis.summary')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.summary}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      {t('predictiveAnalysis.keySignals')}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {aiBriefing.keySignals.map((signal, i) => (
                        <li key={i}>{signal}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      {t('predictiveAnalysis.attention')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.attention}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      {t('predictiveAnalysis.outlook')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.outlook}
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 border-t border-indigo-100 pt-3 text-[11px] text-gray-400">
                {t('predictiveAnalysis.disclaimer')}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}