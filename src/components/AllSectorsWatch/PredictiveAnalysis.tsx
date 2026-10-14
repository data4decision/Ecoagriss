'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
   Constants
───────────────────────────────────────────── */

const AGRICULTURAL_INPUT_VARIABLES: VariableDefinition[] = [
  { key: 'cereal_seeds_tons', label: 'Cereal Seeds', unit: 'tons' },
  { key: 'fertilizer_tons', label: 'Fertilizer', unit: 'tons' },
  { key: 'pesticide_liters', label: 'Pesticide', unit: 'litres' },
  { key: 'improved_seed_use_pct', label: 'Improved Seed Use', unit: '%' },
  { key: 'fertilizer_kg_per_ha', label: 'Fertilizer', unit: 'kg/ha' },
  { key: 'input_price_index_2006_base', label: 'Input Price Index', unit: '2006 base' },
  { key: 'agro_dealer_count', label: 'Agro-dealer Count', unit: 'count' },
  { key: 'input_subsidy_budget_usd', label: 'Input Subsidy Budget', unit: 'USD' },
  { key: 'distribution_timeliness_pct', label: 'Distribution Timeliness', unit: '%' },
  { key: 'stockouts_days_per_year', label: 'Stockouts', unit: 'days/year' },
  { key: 'input_import_value_usd', label: 'Input Import Value', unit: 'USD' },
  { key: 'local_production_inputs_tons', label: 'Local Input Production', unit: 'tons' },
  { key: 'mechanization_units_per_1000_farms', label: 'Mechanization', unit: 'units/1,000 farms' },
  { key: 'credit_access_pct', label: 'Credit Access', unit: '%' },
];

const LIVESTOCK_VARIABLES: VariableDefinition[] = [
  { key: 'cattle_head', label: 'Cattle Population', unit: 'head' },
  { key: 'small_ruminants_head', label: 'Small Ruminants', unit: 'head' },
  { key: 'pigs_head', label: 'Pig Population', unit: 'head' },
  { key: 'poultry_head', label: 'Poultry Population', unit: 'head' },
  { key: 'milk_production_tons', label: 'Milk Production', unit: 'tons' },
  { key: 'meat_production_tons', label: 'Meat Production', unit: 'tons' },
  { key: 'livestock_price_index_2006_base', label: 'Livestock Price Index', unit: '2006 base' },
  { key: 'vaccination_coverage_pct', label: 'Vaccination Coverage', unit: '%' },
  { key: 'fmd_incidents_count', label: 'FMD Incidents', unit: 'count' },
  { key: 'grazing_area_ha', label: 'Grazing Area', unit: 'ha' },
  { key: 'transhumance_events', label: 'Transhumance Events', unit: 'count' },
  { key: 'veterinary_facilities_count', label: 'Veterinary Facilities', unit: 'count' },
  { key: 'feed_imports_tons', label: 'Feed Imports', unit: 'tons' },
  { key: 'local_feed_production_tons', label: 'Local Feed Production', unit: 'tons' },
  { key: 'livestock_exports_tons', label: 'Livestock Exports', unit: 'tons' },
  { key: 'offtake_rate_pct', label: 'Offtake Rate', unit: '%' },
];

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

function getVariablesForSector(
  sector: SectorExplorerFilters['sector']
): VariableDefinition[] {
  return sector === 'agricultural_inputs'
    ? AGRICULTURAL_INPUT_VARIABLES
    : LIVESTOCK_VARIABLES;
}

function isNumericValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatValue(value: unknown): string {
  if (!isNumericValue(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
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

  const availableVariables = useMemo(
    () => getVariablesForSector(filters.sector),
    [filters.sector]
  );

  const countryNameMap = useMemo(() => {
    const map = new Map<number, string>();
    countries.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [countries]);

  const sectorLabel =
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
        setAiError(
          'Not enough historical data to generate a forecast for the current filters.'
        );
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
          ? formatValue(average(endProjections))
          : '—';

      const confidenceLabel =
        historicalRows.length >= 10
          ? 'Medium–High'
          : historicalRows.length >= 5
            ? 'Medium'
            : 'Low';

      const confidenceKey =
        historicalRows.length >= 10
          ? 'medium_high'
          : historicalRows.length >= 5
            ? 'medium'
            : 'low';

      setMetrics([
        {
          label: `Projected (${endYear})`,
          value: projectedSummary,
          sub: 'Avg across selected series',
        },
        {
          label: 'Avg. annual growth',
          value: `${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
          sub: 'Historical trend',
        },
        {
          label: 'Direction',
          value: dir,
          sub: `${horizon}-year outlook`,
        },
        {
          label: 'Confidence',
          value: confidenceLabel,
          sub: 'Based on data coverage',
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

      for (const countryId of filters.countryIds) {
        const countryName =
          countryNameMap.get(countryId) ?? `Country ${countryId}`;

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
            indicator: variable.label,
            unit: variable.unit,
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
        setAiError(
          'Not enough series data to generate an AI interpretation.'
        );
        return;
      }

      setAiLoading(true);

      try {
        const res = await fetch('/api/predictive-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sector: sectorLabel,
            historicalPeriod: `${filters.startYear}–${filters.endYear}`,
            forecastHorizonYears: horizon,
            countries: filters.countryIds.map(
              (id) => countryNameMap.get(id) ?? `Country ${id}`
            ),
            variables: filters.variables.map(
              (k) =>
                availableVariables.find((v) => v.key === k)?.label ?? k
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
              confidence: confidenceKey,
            },
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            typeof json.error === 'string'
              ? json.error
              : 'AI request failed'
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
            : 'Unable to generate AI interpretation.'
        );
      } finally {
        setAiLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to build forecast.';
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
    sectorLabel,
    countries.length,
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
        countryNameMap.get(countryId) ?? `Country ${countryId}`;

      filters.variables.forEach((variableKey) => {
        const variable = availableVariables.find(
          (v) => v.key === variableKey
        );
        if (!variable) return;

        series.push({
          dataKey: `${countryId}_${variableKey}`,
          name: `${countryName} — ${variable.label}`,
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
  ]);

  const lastHistoricalYear = useMemo(() => {
    const historical = chartData.filter((r) => !r.isForecast);
    if (historical.length === 0) return null;
    return historical[historical.length - 1].year as number;
  }, [chartData]);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[var(--dark-green)] via-[#005f00] to-[#003d00] px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--yellow)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-green-100">
                AI-assisted forecast
              </span>
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Predictive Analysis
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-green-50">
              Forecast based on your selected filters. Historical trend is
              extended {horizon} years beyond the last available data year.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              Horizon
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
                  {h} years
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">
              Chart
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
                Line
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
                Bar
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {sectorLabel} · {filters.countryIds.length} countr
          {filters.countryIds.length === 1 ? 'y' : 'ies'} ·{' '}
          {filters.variables.length} variable
          {filters.variables.length === 1 ? '' : 's'}
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
              Building forecast...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <div>
              <p className="font-semibold text-gray-700">
                No forecast available
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Select at least one country and variable in the chart above.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {sectorLabel} Forecast
                </h3>
                <p className="text-sm text-gray-500">
                  Solid = historical · Projected years follow the split
                  {lastHistoricalYear != null && (
                    <> · Split at {lastHistoricalYear}</>
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
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat('en-US', {
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
                        formatValue(value),
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
                          value: 'Forecast →',
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
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickFormatter={(v: number) =>
                        new Intl.NumberFormat('en-US', {
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
                        formatValue(value),
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
                    {m.label === 'Direction' && direction === 'Rising' && (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    )}
                    {m.label === 'Direction' &&
                      direction === 'Declining' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    {m.label === 'Direction' && direction === 'Stable' && (
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
                    AI Interpretation
                  </h3>
                  <p className="text-xs text-gray-500">
                    Model-assisted reading of the forecast above
                  </p>
                </div>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating interpretation...
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
                      Summary
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.summary}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Key signals
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {aiBriefing.keySignals.map((signal, i) => (
                        <li key={i}>{signal}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Attention
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.attention}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Outlook
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {aiBriefing.outlook}
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 border-t border-indigo-100 pt-3 text-[11px] text-gray-400">
                Forecast uses a linear trend model on historical data. AI
                interpretation is constrained to the supplied facts and does
                not invent causes or unsupported recommendations. Pair with
                expert judgment before decisions.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}