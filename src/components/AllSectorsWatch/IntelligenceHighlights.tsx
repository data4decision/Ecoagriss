
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  Info,
  Lightbulb,
  Loader2,
  Minus,
  Target,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

import type {
  SectorExplorerFilters,
  SectorKey,
} from '@/components/AllSectorsWatch/types';

interface IntelligenceHighlightsProps {
  filters: SectorExplorerFilters;
}

interface Country {
  id: number;
  name: string;
}

interface DataRecord {
  country_id: number;
  year: number;
  [key: string]: unknown;
}

type PerformanceDirection =
  | 'higher_is_better'
  | 'lower_is_better'
  | 'neutral';

interface VariableDefinition {
  key: string;
  label: string;
  unit: string;
  performance: PerformanceDirection;
}

interface TimeSeriesPoint {
  year: number;
  value: number;
}

interface YearOverYearChange {
  fromYear: number;
  toYear: number;
  fromValue: number;
  toValue: number;
  changePercent: number | null;
}

type TrendDirection =
  | 'increasing'
  | 'decreasing'
  | 'stable'
  | 'mixed';

interface CountryIndicatorSeries {
  countryId: number;
  countryName: string;
  variable: VariableDefinition;
  series: TimeSeriesPoint[];
  yearOverYearChanges: YearOverYearChange[];
  startYear: number;
  endYear: number;
  startValue: number;
  endValue: number;
  changePercent: number | null;
  averageAnnualChangePercent: number | null;
  highestYear: number;
  highestValue: number;
  lowestYear: number;
  lowestValue: number;
  trend: TrendDirection;
  volatilityPercent: number | null;
  acceleration: 'accelerating' | 'decelerating' | 'steady' | 'insufficient_data';
}

interface CountryMetricResult {
  countryId: number;
  countryName: string;
  variable: VariableDefinition;
  firstYear: number;
  lastYear: number;
  firstValue: number;
  lastValue: number;
  change: number | null;
  performanceValue: number | null;
}

interface CountryPerformanceResult {
  countryId: number;
  countryName: string;
  score: number;
  indicatorsConsidered: number;
}

interface KeySignal {
  id: string;
  direction: 'up' | 'down' | 'stable';
  metric: string;
  text: string;
}

interface AiBriefing {
  summary: string;
  keySignals: string[];
  attention: string;
  outlook: string;
}

const AGRICULTURAL_INPUT_VARIABLES: VariableDefinition[] = [
  {
    key: 'cereal_seeds_tons',
    label: 'Cereal Seeds',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'fertilizer_tons',
    label: 'Fertilizer',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'pesticide_liters',
    label: 'Pesticide',
    unit: 'litres',
    performance: 'higher_is_better',
  },
  {
    key: 'improved_seed_use_pct',
    label: 'Improved Seed Use',
    unit: '%',
    performance: 'higher_is_better',
  },
  {
    key: 'fertilizer_kg_per_ha',
    label: 'Fertilizer',
    unit: 'kg/ha',
    performance: 'higher_is_better',
  },
  {
    key: 'input_price_index_2006_base',
    label: 'Input Price Index',
    unit: '2006 base',
    performance: 'neutral',
  },
  {
    key: 'agro_dealer_count',
    label: 'Agro-dealer Count',
    unit: 'count',
    performance: 'higher_is_better',
  },
  {
    key: 'input_subsidy_budget_usd',
    label: 'Input Subsidy Budget',
    unit: 'USD',
    performance: 'neutral',
  },
  {
    key: 'distribution_timeliness_pct',
    label: 'Distribution Timeliness',
    unit: '%',
    performance: 'higher_is_better',
  },
  {
    key: 'stockouts_days_per_year',
    label: 'Stockouts',
    unit: 'days/year',
    performance: 'lower_is_better',
  },
  {
    key: 'input_import_value_usd',
    label: 'Input Import Value',
    unit: 'USD',
    performance: 'neutral',
  },
  {
    key: 'local_production_inputs_tons',
    label: 'Local Input Production',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'mechanization_units_per_1000_farms',
    label: 'Mechanization',
    unit: 'units/1,000 farms',
    performance: 'higher_is_better',
  },
  {
    key: 'credit_access_pct',
    label: 'Credit Access',
    unit: '%',
    performance: 'higher_is_better',
  },
];

const LIVESTOCK_VARIABLES: VariableDefinition[] = [
  {
    key: 'cattle_head',
    label: 'Cattle Population',
    unit: 'head',
    performance: 'higher_is_better',
  },
  {
    key: 'small_ruminants_head',
    label: 'Small Ruminants',
    unit: 'head',
    performance: 'higher_is_better',
  },
  {
    key: 'pigs_head',
    label: 'Pig Population',
    unit: 'head',
    performance: 'higher_is_better',
  },
  {
    key: 'poultry_head',
    label: 'Poultry Population',
    unit: 'head',
    performance: 'higher_is_better',
  },
  {
    key: 'milk_production_tons',
    label: 'Milk Production',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'meat_production_tons',
    label: 'Meat Production',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'livestock_price_index_2006_base',
    label: 'Livestock Price Index',
    unit: '2006 base',
    performance: 'neutral',
  },
  {
    key: 'vaccination_coverage_pct',
    label: 'Vaccination Coverage',
    unit: '%',
    performance: 'higher_is_better',
  },
  {
    key: 'fmd_incidents_count',
    label: 'FMD Incidents',
    unit: 'count',
    performance: 'lower_is_better',
  },
  {
    key: 'grazing_area_ha',
    label: 'Grazing Area',
    unit: 'ha',
    performance: 'neutral',
  },
  {
    key: 'transhumance_events',
    label: 'Transhumance Events',
    unit: 'count',
    performance: 'neutral',
  },
  {
    key: 'veterinary_facilities_count',
    label: 'Veterinary Facilities',
    unit: 'count',
    performance: 'higher_is_better',
  },
  {
    key: 'feed_imports_tons',
    label: 'Feed Imports',
    unit: 'tons',
    performance: 'neutral',
  },
  {
    key: 'local_feed_production_tons',
    label: 'Local Feed Production',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'livestock_exports_tons',
    label: 'Livestock Exports',
    unit: 'tons',
    performance: 'higher_is_better',
  },
  {
    key: 'offtake_rate_pct',
    label: 'Offtake Rate',
    unit: '%',
    performance: 'neutral',
  },
];

function getVariablesForSector(sector: SectorKey): VariableDefinition[] {
  return sector === 'agricultural_inputs'
    ? AGRICULTURAL_INPUT_VARIABLES
    : LIVESTOCK_VARIABLES;
}

function isNumericValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function calculatePercentageChange(
  firstValue: number,
  lastValue: number
): number | null {
  if (firstValue === 0) {
    return null;
  }

  return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

function formatSignedPercentage(value: number): string {
  return `${value >= 0 ? '+' : '-'}${formatPercentage(value)}`;
}

function getDirection(
  change: number | null
): 'up' | 'down' | 'stable' {
  if (change === null) {
    return 'stable';
  }

  if (change > 2) {
    return 'up';
  }

  if (change < -2) {
    return 'down';
  }

  return 'stable';
}

function getPerformanceValue(
  change: number | null,
  performance: PerformanceDirection
): number | null {
  if (change === null || performance === 'neutral') {
    return null;
  }

  return performance === 'higher_is_better' ? change : -change;
}

function calculateAverageAnnualChange(
  yearOverYearChanges: YearOverYearChange[]
): number | null {
  const validChanges = yearOverYearChanges
    .map((item) => item.changePercent)
    .filter((value): value is number => value !== null);

  if (validChanges.length === 0) {
    return null;
  }

  return (
    validChanges.reduce((total, value) => total + value, 0) /
    validChanges.length
  );
}

function calculateVolatility(
  yearOverYearChanges: YearOverYearChange[]
): number | null {
  const validChanges = yearOverYearChanges
    .map((item) => item.changePercent)
    .filter((value): value is number => value !== null);

  if (validChanges.length < 2) {
    return null;
  }

  const mean =
    validChanges.reduce((total, value) => total + value, 0) /
    validChanges.length;

  const variance =
    validChanges.reduce(
      (total, value) => total + Math.pow(value - mean, 2),
      0
    ) / validChanges.length;

  return Math.sqrt(variance);
}

function getTrendDirection(
  yearOverYearChanges: YearOverYearChange[]
): TrendDirection {
  const validChanges = yearOverYearChanges
    .map((item) => item.changePercent)
    .filter((value): value is number => value !== null);

  if (validChanges.length === 0) {
    return 'stable';
  }

  const positive = validChanges.filter((value) => value > 2).length;
  const negative = validChanges.filter((value) => value < -2).length;

  if (positive > 0 && negative === 0) {
    return 'increasing';
  }

  if (negative > 0 && positive === 0) {
    return 'decreasing';
  }

  if (positive === 0 && negative === 0) {
    return 'stable';
  }

  return 'mixed';
}

function getAcceleration(
  yearOverYearChanges: YearOverYearChange[]
): CountryIndicatorSeries['acceleration'] {
  const validChanges = yearOverYearChanges
    .map((item) => item.changePercent)
    .filter((value): value is number => value !== null);

  if (validChanges.length < 2) {
    return 'insufficient_data';
  }

  const recentChange = validChanges[validChanges.length - 1];
  const previousChange = validChanges[validChanges.length - 2];

  const difference = recentChange - previousChange;

  if (difference > 2) {
    return 'accelerating';
  }

  if (difference < -2) {
    return 'decelerating';
  }

  return 'steady';
}

function buildCountryIndicatorSeries(
  records: DataRecord[],
  variable: VariableDefinition,
  countryNameMap: Map<number, string>
): CountryIndicatorSeries[] {
  const groupedByCountry = new Map<number, TimeSeriesPoint[]>();

  records
    .filter((record) => isNumericValue(record[variable.key]))
    .sort((a, b) => {
      if (a.country_id !== b.country_id) {
        return a.country_id - b.country_id;
      }

      return a.year - b.year;
    })
    .forEach((record) => {
      const value = record[variable.key];

      if (!isNumericValue(value)) {
        return;
      }

      const existing = groupedByCountry.get(record.country_id) ?? [];

      existing.push({
        year: record.year,
        value,
      });

      groupedByCountry.set(record.country_id, existing);
    });

  const results: CountryIndicatorSeries[] = [];

  groupedByCountry.forEach((series, countryId) => {
    if (series.length === 0) {
      return;
    }

    const sortedSeries = [...series].sort(
      (a, b) => a.year - b.year
    );

    const yearOverYearChanges: YearOverYearChange[] = [];

    for (let index = 1; index < sortedSeries.length; index += 1) {
      const previous = sortedSeries[index - 1];
      const current = sortedSeries[index];

      yearOverYearChanges.push({
        fromYear: previous.year,
        toYear: current.year,
        fromValue: previous.value,
        toValue: current.value,
        changePercent: calculatePercentageChange(
          previous.value,
          current.value
        ),
      });
    }

    const firstPoint = sortedSeries[0];
    const lastPoint = sortedSeries[sortedSeries.length - 1];

    const highestPoint = sortedSeries.reduce((highest, point) =>
      point.value > highest.value ? point : highest
    );

    const lowestPoint = sortedSeries.reduce((lowest, point) =>
      point.value < lowest.value ? point : lowest
    );

    results.push({
      countryId,
      countryName:
        countryNameMap.get(countryId) ?? `Country ${countryId}`,
      variable,
      series: sortedSeries,
      yearOverYearChanges,
      startYear: firstPoint.year,
      endYear: lastPoint.year,
      startValue: firstPoint.value,
      endValue: lastPoint.value,
      changePercent: calculatePercentageChange(
        firstPoint.value,
        lastPoint.value
      ),
      averageAnnualChangePercent:
        calculateAverageAnnualChange(yearOverYearChanges),
      highestYear: highestPoint.year,
      highestValue: highestPoint.value,
      lowestYear: lowestPoint.year,
      lowestValue: lowestPoint.value,
      trend: getTrendDirection(yearOverYearChanges),
      volatilityPercent: calculateVolatility(yearOverYearChanges),
      acceleration: getAcceleration(yearOverYearChanges),
    });
  });

  return results;
}

export default function IntelligenceHighlights({
  filters,
}: IntelligenceHighlightsProps) {
  const supabase = useMemo(() => createClient(), []);

  const [countries, setCountries] = useState<Country[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [aiBriefing, setAiBriefing] = useState<AiBriefing | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const variables = useMemo(
    () => getVariablesForSector(filters.sector),
    [filters.sector]
  );

  const selectedVariableDefinitions = useMemo(
    () =>
      filters.variables
        .map((key) =>
          variables.find((variable) => variable.key === key)
        )
        .filter(
          (variable): variable is VariableDefinition =>
            Boolean(variable)
        ),
    [filters.variables, variables]
  );

  const loadIntelligenceData = useCallback(async () => {
    if (
      filters.countryIds.length === 0 ||
      filters.variables.length === 0 ||
      filters.startYear > filters.endYear
    ) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setError(
          'You must be logged in to view intelligence highlights.'
        );
        setData([]);
        return;
      }

      const { data: adminProfile, error: adminError } =
        await supabase
          .from('admin_profiles')
          .select('id, role, status')
          .eq('id', user.id)
          .eq('status', 'active')
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      setIsAdmin(Boolean(adminProfile));

      const { data: countryData, error: countryError } =
        await supabase
          .from('countries')
          .select('id, name')
          .order('name', { ascending: true });

      if (countryError) {
        throw countryError;
      }

      setCountries((countryData ?? []) as Country[]);

      const tableName =
        filters.sector === 'agricultural_inputs'
          ? 'agricultural_inputs'
          : 'livestock_data';

      const selectedColumns = [
        'country_id',
        'year',
        ...filters.variables,
      ].join(', ');

      /*
       * IMPORTANT:
       *
       * This retrieves every available year inside the selected range.
       *
       * Example:
       * startYear = 2020
       * endYear   = 2025
       *
       * Returned years:
       * 2020, 2021, 2022, 2023, 2024, 2025
       */
      const { data: filteredData, error: queryError } =
        await supabase
          .from(tableName)
          .select(selectedColumns)
          .in('country_id', filters.countryIds)
          .gte('year', filters.startYear)
          .lte('year', filters.endYear)
          .order('year', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setData((filteredData ?? []) as unknown as DataRecord[]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load intelligence highlights.';

      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.countryIds,
    filters.endYear,
    filters.sector,
    filters.startYear,
    filters.variables,
    supabase,
  ]);

  useEffect(() => {
    void loadIntelligenceData();
  }, [loadIntelligenceData]);

  const countryNameMap = useMemo(() => {
    const map = new Map<number, string>();

    countries.forEach((country) => {
      map.set(country.id, country.name);
    });

    return map;
  }, [countries]);

  /*
   * FULL YEAR-BY-YEAR SERIES
   *
   * This is the important addition.
   *
   * The original component only retained:
   * firstYear → lastYear
   *
   * This structure retains:
   * 2020 → 2021 → 2022 → 2023 → 2024 → 2025
   *
   * for every selected country and variable.
   */
  const countryIndicatorSeries = useMemo(
    () =>
      selectedVariableDefinitions.flatMap((variable) =>
        buildCountryIndicatorSeries(
          data,
          variable,
          countryNameMap
        )
      ),
    [countryNameMap, data, selectedVariableDefinitions]
  );

  /*
   * Existing first-to-last metrics are preserved.
   *
   * These are still used for:
   * - country performance
   * - indicator comparison
   * - computed signals
   */
  const countryMetricResults = useMemo<CountryMetricResult[]>(
    () => {
      const results: CountryMetricResult[] = [];

      countryIndicatorSeries.forEach((series) => {
        if (series.series.length < 2) {
          return;
        }

        results.push({
          countryId: series.countryId,
          countryName: series.countryName,
          variable: series.variable,
          firstYear: series.startYear,
          lastYear: series.endYear,
          firstValue: series.startValue,
          lastValue: series.endValue,
          change: series.changePercent,
          performanceValue: getPerformanceValue(
            series.changePercent,
            series.variable.performance
          ),
        });
      });

      return results;
    },
    [countryIndicatorSeries]
  );

  const countryPerformance = useMemo<
    CountryPerformanceResult[]
  >(() => {
    if (!isAdmin || filters.countryIds.length < 2) {
      return [];
    }

    const scoreMap = new Map<
      number,
      {
        countryName: string;
        scores: number[];
      }
    >();

    selectedVariableDefinitions.forEach((variable) => {
      if (variable.performance === 'neutral') {
        return;
      }

      const resultsForVariable = countryMetricResults.filter(
        (result) =>
          result.variable.key === variable.key &&
          result.performanceValue !== null
      );

      if (resultsForVariable.length < 2) {
        return;
      }

      const ranked = [...resultsForVariable].sort(
        (a, b) =>
          (b.performanceValue ?? 0) -
          (a.performanceValue ?? 0)
      );

      const denominator = ranked.length - 1;

      ranked.forEach((result, index) => {
        const score =
          denominator === 0
            ? 100
            : ((denominator - index) / denominator) * 100;

        const existing = scoreMap.get(result.countryId) ?? {
          countryName: result.countryName,
          scores: [],
        };

        existing.scores.push(score);
        scoreMap.set(result.countryId, existing);
      });
    });

    return Array.from(scoreMap.entries())
      .map(([countryId, result]) => ({
        countryId,
        countryName: result.countryName,
        score:
          result.scores.length > 0
            ? result.scores.reduce(
                (total, score) => total + score,
                0
              ) / result.scores.length
            : 0,
        indicatorsConsidered: result.scores.length,
      }))
      .sort((a, b) => b.score - a.score);
  }, [
    countryMetricResults,
    filters.countryIds.length,
    isAdmin,
    selectedVariableDefinitions,
  ]);

  const indicatorComparisons = useMemo(() => {
    if (!isAdmin || filters.countryIds.length < 2) {
      return [];
    }

    return selectedVariableDefinitions
      .filter(
        (variable) => variable.performance !== 'neutral'
      )
      .map((variable) => {
        const results = countryMetricResults
          .filter(
            (result) =>
              result.variable.key === variable.key &&
              result.performanceValue !== null
          )
          .sort(
            (a, b) =>
              (b.performanceValue ?? 0) -
              (a.performanceValue ?? 0)
          );

        if (results.length < 2) {
          return null;
        }

        return {
          variable,
          strongest: results[0],
          weakest: results[results.length - 1],
        };
      })
      .filter(
        (
          comparison
        ): comparison is {
          variable: VariableDefinition;
          strongest: CountryMetricResult;
          weakest: CountryMetricResult;
        } => Boolean(comparison)
      );
  }, [
    countryMetricResults,
    filters.countryIds.length,
    isAdmin,
    selectedVariableDefinitions,
  ]);

  const keySignals = useMemo<KeySignal[]>(() => {
    const ranked = [...countryMetricResults]
      .filter((result) => result.change !== null)
      .sort(
        (a, b) =>
          Math.abs(b.change ?? 0) -
          Math.abs(a.change ?? 0)
      );

    return ranked.slice(0, 5).map((result) => {
      const direction = getDirection(result.change);

      let text = `${result.variable.label}: ${result.countryName} moved from ${formatNumber(
        result.firstValue
      )} to ${formatNumber(result.lastValue)} ${
        result.variable.unit
      }.`;

      if (
        result.variable.performance === 'lower_is_better' &&
        result.change !== null &&
        result.change < -2
      ) {
        text = `${result.countryName} reduced ${result.variable.label.toLowerCase()} by ${formatPercentage(
          result.change
        )}, indicating improvement.`;
      } else if (
        result.variable.performance === 'lower_is_better' &&
        result.change !== null &&
        result.change > 2
      ) {
        text = `${result.countryName} saw ${result.variable.label.toLowerCase()} rise by ${formatPercentage(
          result.change
        )}, a potential risk signal.`;
      } else if (
        result.change !== null &&
        Math.abs(result.change) > 2
      ) {
        text = `${result.variable.label}: ${
          result.countryName
        } ${
          result.change > 0 ? 'improved' : 'declined'
        } by ${formatPercentage(
          result.change
        )} over the selected period.`;
      } else if (result.change !== null) {
        text = `${result.variable.label}: ${result.countryName} remained broadly stable over the selected period.`;
      }

      return {
        id: `${result.countryId}-${result.variable.key}`,
        direction,
        metric: result.variable.label,
        text,
      };
    });
  }, [countryMetricResults]);

  const selectedCountryNames = useMemo(
    () =>
      filters.countryIds
        .map((id) => countryNameMap.get(id))
        .filter(
          (name): name is string => Boolean(name)
        ),
    [countryNameMap, filters.countryIds]
  );

  const sectorLabel =
    filters.sector === 'agricultural_inputs'
      ? 'Agricultural Inputs'
      : 'Livestock';

  const selectedVariableLabel =
    selectedVariableDefinitions.length === 1
      ? selectedVariableDefinitions[0].label
      : `${selectedVariableDefinitions.length} variables`;

  const hasAdminComparison =
    isAdmin &&
    filters.countryIds.length >= 2 &&
    countryPerformance.length >= 2;

  const strongestCountry = hasAdminComparison
    ? countryPerformance[0]
    : null;

  const weakestCountry = hasAdminComparison
    ? countryPerformance[countryPerformance.length - 1]
    : null;

  const hasContent =
    countryMetricResults.length > 0 ||
    hasAdminComparison ||
    keySignals.length > 0;

  /*
   * AI PAYLOAD
   *
   * The AI now receives the complete time series.
   *
   * It does NOT have to guess what happened between the
   * start and end years.
   */
  const intelligencePayload = useMemo(() => {
    if (countryIndicatorSeries.length === 0) {
      return null;
    }

    return {
      sector: sectorLabel,

      period: `${filters.startYear}–${filters.endYear}`,

      countries: selectedCountryNames,

      variables: selectedVariableDefinitions.map(
        (item) => item.label
      ),

      /*
       * Complete country × indicator × year data.
       */
      timeSeries: countryIndicatorSeries.map((item) => ({
        country: item.countryName,

        indicator: item.variable.label,

        unit: item.variable.unit,

        performance: item.variable.performance,

        series: item.series.map((point) => ({
          year: point.year,
          value: point.value,
        })),

        yearOverYearChanges: item.yearOverYearChanges.map(
          (change) => ({
            fromYear: change.fromYear,
            toYear: change.toYear,
            changePercent: change.changePercent,
          })
        ),

        analysis: {
          startYear: item.startYear,
          endYear: item.endYear,

          startValue: item.startValue,
          endValue: item.endValue,

          changePercent: item.changePercent,

          averageAnnualChangePercent:
            item.averageAnnualChangePercent,

          highestYear: item.highestYear,
          highestValue: item.highestValue,

          lowestYear: item.lowestYear,
          lowestValue: item.lowestValue,

          trend: item.trend,

          volatilityPercent: item.volatilityPercent,

          acceleration: item.acceleration,
        },
      })),

      /*
       * Existing overall country comparison.
       */
      overall:
        hasAdminComparison &&
        strongestCountry &&
        weakestCountry
          ? {
              strongest: {
                country: strongestCountry.countryName,
                score: Number(
                  strongestCountry.score.toFixed(0)
                ),
              },

              weakest: {
                country: weakestCountry.countryName,
                score: Number(
                  weakestCountry.score.toFixed(0)
                ),
              },
            }
          : null,

      /*
       * Existing indicator-level comparison.
       */
      indicators: indicatorComparisons.map(
        ({ variable, strongest, weakest }) => ({
          name: variable.label,

          strongest: strongest.countryName,

          strongestChange: strongest.change,

          weakest: weakest.countryName,

          weakestChange: weakest.change,
        })
      ),

      /*
       * Existing deterministic signals.
       */
      signals: keySignals.map((signal) => signal.text),
    };
  }, [
    countryIndicatorSeries,
    filters.endYear,
    filters.startYear,
    hasAdminComparison,
    indicatorComparisons,
    keySignals,
    sectorLabel,
    selectedCountryNames,
    selectedVariableDefinitions,
    strongestCountry,
    weakestCountry,
  ]);

  /*
   * Send the complete deterministic analysis to the AI.
   */
  useEffect(() => {
    if (!intelligencePayload || loading || error) {
      setAiBriefing(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setAiLoading(true);
      setAiError(null);

      try {
        const response = await fetch('/api/intelligence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(intelligencePayload),
          signal: controller.signal,
        });

        const result: unknown = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof result === 'object' &&
            result !== null &&
            'error' in result &&
            typeof result.error === 'string'
              ? result.error
              : 'Unable to generate AI briefing.';

          throw new Error(errorMessage);
        }

        const briefing =
          typeof result === 'object' &&
          result !== null
            ? result
            : {};

        const summary =
          'summary' in briefing &&
          typeof briefing.summary === 'string'
            ? briefing.summary
            : '';

        const keySignalsFromAi =
          'keySignals' in briefing &&
          Array.isArray(briefing.keySignals)
            ? briefing.keySignals.filter(
                (signal): signal is string =>
                  typeof signal === 'string'
              )
            : [];

        const attention =
          'attention' in briefing &&
          typeof briefing.attention === 'string'
            ? briefing.attention
            : '';

        const outlook =
          'outlook' in briefing &&
          typeof briefing.outlook === 'string'
            ? briefing.outlook
            : '';

        setAiBriefing({
          summary,
          keySignals: keySignalsFromAi,
          attention,
          outlook,
        });
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to generate AI briefing.';

        setAiError(message);
        setAiBriefing(null);
      } finally {
        if (!controller.signal.aborted) {
          setAiLoading(false);
        }
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [error, intelligencePayload, loading]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex min-h-[280px] items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Interpreting the selected data...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#062f24] via-[#075b3d] to-[#0b3939] px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-300" />

              <span className="text-sm font-semibold uppercase tracking-wider text-green-100">
                Intelligence Highlights
              </span>
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">
              Signals Worth Watching
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-green-50">
              Unified interpretation of the data currently
              selected in the Sector Data Explorer, with
              AI-assisted briefing.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-green-300" />

            <div>
              <p className="text-xs text-green-100">
                Data-driven
              </p>

              <p className="text-sm font-semibold">
                {isAdmin
                  ? hasAdminComparison
                    ? 'Admin comparison'
                    : 'Admin view'
                  : 'Authorised view'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-green-50">
            {sectorLabel}
          </span>

          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-green-50">
            {filters.startYear}–{filters.endYear}
          </span>

          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-green-50">
            {selectedCountryNames.length === 1
              ? selectedCountryNames[0]
              : `${selectedCountryNames.length} countries`}
          </span>

          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-green-50">
            {selectedVariableLabel}
          </span>
        </div>
      </div>

      {error && (
        <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && !hasContent ? (
        <div className="p-6">
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <div>
              <BarChart3 className="mx-auto h-8 w-8 text-gray-400" />

              <p className="mt-3 font-semibold text-gray-700">
                No intelligence signals available
              </p>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                There is not enough data within the current
                filters to generate a meaningful
                interpretation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        !error && (
          <div className="divide-y divide-gray-100">
            {/* Overall Country Performance */}
            {hasAdminComparison &&
              strongestCountry &&
              weakestCountry && (
                <div className="p-5 sm:p-7">
                  <div className="mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-700" />

                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                      Overall Country Performance
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Strongest performance
                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {strongestCountry.countryName}
                      </p>

                      <p className="mt-1 text-lg font-semibold text-emerald-800">
                        {strongestCountry.score.toFixed(0)} / 100
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Across{' '}
                        {strongestCountry.indicatorsConsidered}{' '}
                        comparable indicator
                        {strongestCountry.indicatorsConsidered ===
                        1
                          ? ''
                          : 's'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Needs attention
                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {weakestCountry.countryName}
                      </p>

                      <p className="mt-1 text-lg font-semibold text-amber-800">
                        {weakestCountry.score.toFixed(0)} / 100
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Across{' '}
                        {weakestCountry.indicatorsConsidered}{' '}
                        comparable indicator
                        {weakestCountry.indicatorsConsidered ===
                        1
                          ? ''
                          : 's'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Indicator Performance table */}
            {hasAdminComparison &&
              indicatorComparisons.length > 0 && (
                <div className="p-5 sm:p-7">
                  <div className="mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-700" />

                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                      Indicator Performance
                    </h3>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-4 py-3">
                            Indicator
                          </th>

                          <th className="px-4 py-3">
                            Strongest
                          </th>

                          <th className="px-4 py-3">
                            Needs Attention
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {indicatorComparisons.map(
                          ({
                            variable,
                            strongest,
                            weakest,
                          }) => (
                            <tr
                              key={variable.key}
                              className="hover:bg-gray-50/80"
                            >
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {variable.label}

                                <span className="mt-0.5 block text-xs font-normal text-gray-400">
                                  {variable.unit}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-emerald-800">
                                <span className="font-semibold">
                                  {strongest.countryName}
                                </span>

                                {strongest.change !== null && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    {formatSignedPercentage(
                                      strongest.change
                                    )}
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-amber-800">
                                <span className="font-semibold">
                                  {weakest.countryName}
                                </span>

                                {weakest.change !== null && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    {formatSignedPercentage(
                                      weakest.change
                                    )}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* AI Briefing */}
            <div className="p-5 sm:p-7">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />

                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                  AI Intelligence Briefing
                </h3>
              </div>

              <p className="mb-4 text-xs leading-5 text-gray-500">
                AI-generated interpretation based on the
                complete selected time series, countries,
                period, sector and variables. Scores,
                percentages, trends and statistical summaries
                are calculated by the application; the model
                interprets those measured facts.
              </p>

              {aiLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating interpretation from measured
                  results...
                </div>
              )}

              {!aiLoading && aiError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  AI briefing unavailable: {aiError}
                </div>
              )}

              {!aiLoading && !aiError && aiBriefing && (
                <div className="space-y-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-5">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Overall assessment
                    </p>

                    <p className="text-sm leading-6 text-gray-800">
                      {aiBriefing.summary}
                    </p>
                  </div>

                  {aiBriefing.keySignals.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Key signals
                      </p>

                      <ul className="space-y-2">
                        {aiBriefing.keySignals.map(
                          (signal, index) => (
                            <li
                              key={`${signal}-${index}`}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />

                              <span>{signal}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                      Needs attention
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      {aiBriefing.attention}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Outlook
                    </p>

                    <p className="text-sm leading-6 text-gray-700">
                      {aiBriefing.outlook}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Deterministic key signals fallback list */}
            {keySignals.length > 0 && (
              <div className="p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />

                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                    Computed Signals
                  </h3>
                </div>

                <ul className="space-y-3">
                  {keySignals.map((signal) => {
                    const DirectionIcon =
                      signal.direction === 'up'
                        ? ArrowUpRight
                        : signal.direction === 'down'
                          ? ArrowDownRight
                          : Minus;

                    return (
                      <li
                        key={signal.id}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            signal.direction === 'up'
                              ? 'bg-emerald-100 text-emerald-700'
                              : signal.direction === 'down'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          <DirectionIcon className="h-4 w-4" />
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {signal.metric}
                          </p>

                          <p className="mt-0.5 text-sm leading-6 text-gray-600">
                            {signal.text}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Methodology */}
            <div className="bg-gray-50 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                <div className="space-y-2 text-xs leading-5 text-gray-500">
                  <p>
                    <strong className="text-gray-700">
                      How this works:{' '}
                    </strong>
                    the application retrieves every available
                    year within the selected period and
                    calculates percentage changes, year-on-year
                    changes, rankings, trends, volatility and
                    performance scores from the selected
                    dataset. The AI briefing interprets these
                    computed facts. It does not recalculate
                    metrics or invent data.
                  </p>

                  <p>
                    The intelligence layer preserves the full
                    selected time series. For example, a
                    2020–2025 selection includes 2020, 2021,
                    2022, 2023, 2024 and 2025 rather than only
                    the endpoint years.
                  </p>

                  {hasAdminComparison && (
                    <p>
                      For multi-country comparisons, each
                      performance-relevant indicator is ranked
                      separately. Indicator scores are averaged
                      into an overall country performance score.
                      Higher-is-better and lower-is-better
                      metrics are handled accordingly; neutral
                      indicators are excluded from the score.
                    </p>
                  )}

                  <p>
                    This is a relative assessment within the
                    current selection only — not an absolute
                    national ranking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </section>
  );
}
