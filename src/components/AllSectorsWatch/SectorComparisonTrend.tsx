'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Check,
  ChevronDown,
  Filter,
  Loader2,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export interface SectorExplorerFilters {
  countryIds: number[];
  startYear: number;
  endYear: number;
  sector: 'agricultural_inputs' | 'livestock';
  variables: string[];
}

interface SectorComparisonTrendProps {
  filters: SectorExplorerFilters;
  onFiltersChange: (filters: SectorExplorerFilters) => void;
}

interface Country {
  id: number;
  name: string;
}

interface DataRecord {
  id: number;
  country_id: number;
  year: number;
  [key: string]: unknown;
}

interface ChartRow {
  year: number;
  [key: string]: number | string | null;
}

type SectorKey = 'agricultural_inputs' | 'livestock';

interface VariableDefinition {
  key: string;
  label: string;
  unit: string;
}

const DATA_START_YEAR = 2006;
const DATA_END_YEAR = 2025;

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

function getVariableKeysForSector(sector: SectorKey) {
  return sector === 'agricultural_inputs'
    ? AGRICULTURAL_INPUT_VARIABLE_KEYS
    : LIVESTOCK_VARIABLE_KEYS;
}

function isNumericValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatChartValue(value: unknown, locale: string): string {
  if (!isNumericValue(value)) {
    return '—';
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
}

function buildYTicks(data: ChartRow[], seriesKeys: string[]): number[] {
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

export default function SectorComparisonTrend({
  filters,
  onFiltersChange,
}: SectorComparisonTrendProps) {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'en';

  const supabase = useMemo(() => createClient(), []);

  const [countries, setCountries] = useState<Country[]>([]);
  const [chartData, setChartData] = useState<ChartRow[]>([]);

  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [countryDropdownOpen, setCountryDropdownOpen] =
    useState(false);

  const [variableDropdownOpen, setVariableDropdownOpen] =
    useState(false);

  const years = useMemo(
    () =>
      Array.from(
        {
          length: DATA_END_YEAR - DATA_START_YEAR + 1,
        },
        (_, index) => DATA_START_YEAR + index
      ),
    []
  );

  const availableVariables = useMemo((): VariableDefinition[] => {
    return getVariableKeysForSector(filters.sector).map((v) => ({
      key: v.key,
      label: t(`sectorComparisonTrend.variables.${v.key}`),
      unit: t(`sectorComparisonTrend.units.${v.unitKey}`),
    }));
  }, [filters.sector, t]);

  const countryNameMap = useMemo(() => {
    const map = new Map<number, string>();

    countries.forEach((country) => {
      map.set(country.id, country.name);
    });

    return map;
  }, [countries]);

  const selectedCountries = useMemo(
    () =>
      countries.filter((country) =>
        filters.countryIds.includes(country.id)
      ),
    [countries, filters.countryIds]
  );

  const selectedVariableLabels = useMemo(
    () =>
      filters.variables
        .map(
          (key) =>
            availableVariables.find(
              (variable) => variable.key === key
            )?.label
        )
        .filter(
          (label): label is string => Boolean(label)
        ),
    [availableVariables, filters.variables]
  );

  const updateFilters = useCallback(
    (updates: Partial<SectorExplorerFilters>) => {
      onFiltersChange({
        ...filters,
        ...updates,
      });
    },
    [filters, onFiltersChange]
  );

  const loadMetadata = useCallback(async () => {
    setLoadingMetadata(true);
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
        setError(t('sectorComparisonTrend.errors.mustBeLoggedIn'));
        return;
      }

      const {
        data: countryData,
        error: countryError,
      } = await supabase
        .from('countries')
        .select('id, name')
        .order('name', {
          ascending: true,
        });

      if (countryError) {
        throw countryError;
      }

      const loadedCountries =
        (countryData ?? []) as Country[];

      setCountries(loadedCountries);

      if (filters.countryIds.length === 0 && loadedCountries.length > 0) {
        onFiltersChange({
          ...filters,
          countryIds: [loadedCountries[0].id],
        });
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : t('sectorComparisonTrend.errors.unableToLoadFilters');

      setError(message);
    } finally {
      setLoadingMetadata(false);
    }
  }, [filters, onFiltersChange, supabase, t]);

  useEffect(() => {
    void loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    const validVariables = filters.variables.filter(
      (variableKey) =>
        availableVariables.some(
          (variable) => variable.key === variableKey
        )
    );

    if (validVariables.length === 0 && availableVariables.length > 0) {
      updateFilters({
        variables: [availableVariables[0].key],
      });

      setChartData([]);
      return;
    }

    if (validVariables.length !== filters.variables.length) {
      updateFilters({
        variables: validVariables,
      });
    }

    setChartData([]);
  }, [availableVariables, filters.variables, updateFilters]);

  const toggleCountry = (countryIdToToggle: number) => {
    const currentCountryIds = filters.countryIds;

    if (currentCountryIds.includes(countryIdToToggle)) {
      if (currentCountryIds.length === 1) {
        return;
      }

      updateFilters({
        countryIds: currentCountryIds.filter(
          (id) => id !== countryIdToToggle
        ),
      });

      return;
    }

    updateFilters({
      countryIds: [...currentCountryIds, countryIdToToggle],
    });
  };

  const toggleVariable = (variableKey: string) => {
    const currentVariables = filters.variables;

    if (currentVariables.includes(variableKey)) {
      if (currentVariables.length === 1) {
        return;
      }

      updateFilters({
        variables: currentVariables.filter(
          (key) => key !== variableKey
        ),
      });

      return;
    }

    updateFilters({
      variables: [...currentVariables, variableKey],
    });
  };

  const selectAllCountries = () => {
    updateFilters({
      countryIds: countries.map((country) => country.id),
    });
  };

  const clearAdditionalCountries = () => {
    if (countries.length === 0) {
      return;
    }

    updateFilters({
      countryIds: [countries[0].id],
    });
  };

  const handleStartYearChange = (value: number) => {
    updateFilters({
      startYear: value,
      endYear: value > filters.endYear ? value : filters.endYear,
    });
  };

  const handleEndYearChange = (value: number) => {
    updateFilters({
      endYear: value,
      startYear:
        value < filters.startYear ? value : filters.startYear,
    });
  };

  const handleSectorChange = (value: SectorKey) => {
    const nextKeys = getVariableKeysForSector(value);

    updateFilters({
      sector: value,
      variables: [nextKeys[0].key],
    });

    setChartData([]);
  };

  const loadChartData = useCallback(async () => {
    if (
      filters.countryIds.length === 0 ||
      filters.variables.length === 0 ||
      filters.startYear > filters.endYear
    ) {
      setChartData([]);
      return;
    }

    setLoadingChart(true);
    setError(null);

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
        .order('year', {
          ascending: true,
        });

      if (queryError) {
        throw queryError;
      }

      const records =
        (data ?? []) as unknown as DataRecord[];

      const rows = new Map<number, ChartRow>();

      records.forEach((record) => {
        const year = record.year;

        if (!rows.has(year)) {
          rows.set(year, {
            year,
          });
        }

        const row = rows.get(year);

        if (!row) {
          return;
        }

        filters.variables.forEach((variableKey) => {
          const value = record[variableKey];

          if (!isNumericValue(value)) {
            return;
          }

          const seriesKey = `${record.country_id}_${variableKey}`;

          row[seriesKey] = value;
        });
      });

      setChartData(
        Array.from(rows.values()).sort(
          (a, b) => a.year - b.year
        )
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : t('sectorComparisonTrend.errors.unableToLoadData');

      setError(message);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [filters, supabase, t]);

  useEffect(() => {
    if (loadingMetadata) {
      return;
    }

    void loadChartData();
  }, [loadChartData, loadingMetadata]);

  const chartSeries = useMemo(() => {
    const series: Array<{
      dataKey: string;
      label: string;
      color: string;
      variable: VariableDefinition;
      countryName: string;
    }> = [];

    let colorIndex = 0;

    filters.countryIds.forEach((selectedId) => {
      const countryName =
        countryNameMap.get(selectedId) ??
        t('sectorComparisonTrend.countryFallback', { id: selectedId });

      filters.variables.forEach((variableKey) => {
        const variable = availableVariables.find(
          (item) => item.key === variableKey
        );

        if (!variable) {
          return;
        }

        series.push({
          dataKey: `${selectedId}_${variableKey}`,
          label: t('sectorComparisonTrend.seriesName', {
            country: countryName,
            indicator: variable.label,
          }),
          color: CHART_COLORS[colorIndex % CHART_COLORS.length],
          variable,
          countryName,
        });

        colorIndex += 1;
      });
    });

    return series;
  }, [
    availableVariables,
    countryNameMap,
    filters.countryIds,
    filters.variables,
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

  const sectorLabel = t(
    `sectorComparisonTrend.sectors.${filters.sector}`
  );

  if (loadingMetadata) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('sectorComparisonTrend.loading')}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[var(--dark-green)] via-[#005f00] to-[#003d00] px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Filter className="h-5 w-5" />

              <span className="text-sm font-semibold uppercase tracking-wider text-green-100">
                {t('sectorComparisonTrend.badge')}
              </span>
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">
              {t('sectorComparisonTrend.title')}
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-green-50">
              {t('sectorComparisonTrend.subtitle')}
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <p className="text-green-100">
              {t('sectorComparisonTrend.datasetPeriod')}
            </p>

            <p className="mt-1 font-bold">
              {DATA_START_YEAR} – {DATA_END_YEAR}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50/80 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              {t('sectorComparisonTrend.filters.country')}
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setCountryDropdownOpen((current) => !current)
                }
                className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-sm shadow-sm transition hover:border-[var(--dark-green)]"
              >
                <span className="truncate text-gray-700">
                  {selectedCountries.length === 0
                    ? t('sectorComparisonTrend.filters.selectCountries')
                    : selectedCountries.length === 1
                      ? selectedCountries[0].name
                      : t('sectorComparisonTrend.filters.countriesSelected', {
                          count: selectedCountries.length,
                        })}
                </span>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    countryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {countryDropdownOpen && (
                <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-2 pb-2">
                    <button
                      type="button"
                      onClick={selectAllCountries}
                      className="text-xs font-semibold text-[var(--dark-green)] hover:underline"
                    >
                      {t('sectorComparisonTrend.filters.selectAll')}
                    </button>

                    <button
                      type="button"
                      onClick={clearAdditionalCountries}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      {t('sectorComparisonTrend.filters.reset')}
                    </button>
                  </div>

                  {countries.map((country) => {
                    const selected =
                      filters.countryIds.includes(country.id);

                    return (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => toggleCountry(country.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            selected
                              ? 'border-[var(--dark-green)] bg-[var(--dark-green)] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </span>

                        <span className="text-gray-700">
                          {country.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="sector-start-year"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              {t('sectorComparisonTrend.filters.startYear')}
            </label>

            <select
              id="sector-start-year"
              value={filters.startYear}
              onChange={(event) =>
                handleStartYearChange(Number(event.target.value))
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sector-end-year"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              {t('sectorComparisonTrend.filters.endYear')}
            </label>

            <select
              id="sector-end-year"
              value={filters.endYear}
              onChange={(event) =>
                handleEndYearChange(Number(event.target.value))
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sector-select"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              {t('sectorComparisonTrend.filters.sector')}
            </label>

            <select
              id="sector-select"
              value={filters.sector}
              onChange={(event) =>
                handleSectorChange(event.target.value as SectorKey)
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              <option value="agricultural_inputs">
                {t('sectorComparisonTrend.sectors.agricultural_inputs')}
              </option>

              <option value="livestock">
                {t('sectorComparisonTrend.sectors.livestock')}
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            {t('sectorComparisonTrend.filters.variables')}
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setVariableDropdownOpen((current) => !current)
              }
              className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-sm shadow-sm transition hover:border-[var(--dark-green)]"
            >
              <span className="truncate text-gray-700">
                {selectedVariableLabels.length === 1
                  ? selectedVariableLabels[0]
                  : t('sectorComparisonTrend.filters.variablesSelected', {
                      count: selectedVariableLabels.length,
                    })}
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  variableDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {variableDropdownOpen && (
              <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                {availableVariables.map((variable) => {
                  const selected =
                    filters.variables.includes(variable.key);

                  return (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => toggleVariable(variable.key)}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? 'border-[var(--dark-green)] bg-[var(--dark-green)] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selected && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </span>

                      <span>
                        <span className="block text-sm font-medium text-gray-700">
                          {variable.label}
                        </span>

                        <span className="block text-xs text-gray-400">
                          {variable.unit}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            {t('sectorComparisonTrend.activeFilters')}
          </span>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            {filters.startYear}–{filters.endYear}
          </span>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            {sectorLabel}
          </span>

          {selectedCountries.length > 0 && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
              {t('sectorComparisonTrend.countryCount', {
                count: selectedCountries.length,
              })}
            </span>
          )}

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {t('sectorComparisonTrend.variableCount', {
              count: filters.variables.length,
            })}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingChart ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('sectorComparisonTrend.loadingChart')}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <div>
              <p className="font-semibold text-gray-700">
                {t('sectorComparisonTrend.emptyTitle')}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {t('sectorComparisonTrend.emptyDescription')}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {t('sectorComparisonTrend.trendsTitle', {
                    sector: sectorLabel,
                  })}
                </h3>

                <p className="text-sm text-gray-500">
                  {filters.startYear}–{filters.endYear} ·{' '}
                  {t('sectorComparisonTrend.countryCount', {
                    count: selectedCountries.length,
                  })}{' '}
                  ·{' '}
                  {t('sectorComparisonTrend.variableCount', {
                    count: filters.variables.length,
                  })}
                </p>
              </div>

              <div className="text-xs text-gray-400">
                {t('sectorComparisonTrend.yearsDisplayed', {
                  count: chartData.length,
                })}
              </div>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{
                      stroke: '#D1D5DB',
                    }}
                  />

                  <YAxis
                    ticks={yTicks}
                    domain={[
                      0,
                      yTicks[yTicks.length - 1] ?? 'auto',
                    ]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{
                      stroke: '#D1D5DB',
                    }}
                    width={55}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat(locale, {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      boxShadow:
                        '0 10px 25px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '6px',
                    }}
                    formatter={(
                      value: unknown,
                      name: unknown
                    ) => {
                      const series = chartSeries.find(
                        (item) => item.dataKey === String(name)
                      );

                      return [
                        formatChartValue(value, locale),
                        series?.label ?? String(name),
                      ];
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      paddingTop: '15px',
                      fontSize: '12px',
                    }}
                  />

                  {chartSeries.map((series) => (
                    <Line
                      key={series.dataKey}
                      type="monotone"
                      dataKey={series.dataKey}
                      name={series.label}
                      stroke={series.color}
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 1,
                      }}
                      activeDot={{
                        r: 5,
                      }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs leading-5 text-amber-800">
                <strong>
                  {t('sectorComparisonTrend.interpretationNoteTitle')}
                </strong>{' '}
                {t('sectorComparisonTrend.interpretationNoteBody')}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}