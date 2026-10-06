
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

interface Profile {
  country: string | null;
}

interface AdminProfile {
  id: string;
  role: string;
  status: string;
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

const AGRICULTURAL_INPUT_VARIABLES: VariableDefinition[] = [
  {
    key: 'cereal_seeds_tons',
    label: 'Cereal Seeds',
    unit: 'tons',
  },
  {
    key: 'fertilizer_tons',
    label: 'Fertilizer',
    unit: 'tons',
  },
  {
    key: 'pesticide_liters',
    label: 'Pesticide',
    unit: 'litres',
  },
  {
    key: 'improved_seed_use_pct',
    label: 'Improved Seed Use',
    unit: '%',
  },
  {
    key: 'fertilizer_kg_per_ha',
    label: 'Fertilizer',
    unit: 'kg/ha',
  },
  {
    key: 'input_price_index_2006_base',
    label: 'Input Price Index',
    unit: '2006 base',
  },
  {
    key: 'agro_dealer_count',
    label: 'Agro-dealer Count',
    unit: 'count',
  },
  {
    key: 'input_subsidy_budget_usd',
    label: 'Input Subsidy Budget',
    unit: 'USD',
  },
  {
    key: 'distribution_timeliness_pct',
    label: 'Distribution Timeliness',
    unit: '%',
  },
  {
    key: 'stockouts_days_per_year',
    label: 'Stockouts',
    unit: 'days/year',
  },
  {
    key: 'input_import_value_usd',
    label: 'Input Import Value',
    unit: 'USD',
  },
  {
    key: 'local_production_inputs_tons',
    label: 'Local Input Production',
    unit: 'tons',
  },
  {
    key: 'mechanization_units_per_1000_farms',
    label: 'Mechanization',
    unit: 'units/1,000 farms',
  },
  {
    key: 'credit_access_pct',
    label: 'Credit Access',
    unit: '%',
  },
];

const LIVESTOCK_VARIABLES: VariableDefinition[] = [
  {
    key: 'cattle_head',
    label: 'Cattle Population',
    unit: 'head',
  },
  {
    key: 'small_ruminants_head',
    label: 'Small Ruminants',
    unit: 'head',
  },
  {
    key: 'pigs_head',
    label: 'Pig Population',
    unit: 'head',
  },
  {
    key: 'poultry_head',
    label: 'Poultry Population',
    unit: 'head',
  },
  {
    key: 'milk_production_tons',
    label: 'Milk Production',
    unit: 'tons',
  },
  {
    key: 'meat_production_tons',
    label: 'Meat Production',
    unit: 'tons',
  },
  {
    key: 'livestock_price_index_2006_base',
    label: 'Livestock Price Index',
    unit: '2006 base',
  },
  {
    key: 'vaccination_coverage_pct',
    label: 'Vaccination Coverage',
    unit: '%',
  },
  {
    key: 'fmd_incidents_count',
    label: 'FMD Incidents',
    unit: 'count',
  },
  {
    key: 'grazing_area_ha',
    label: 'Grazing Area',
    unit: 'ha',
  },
  {
    key: 'transhumance_events',
    label: 'Transhumance Events',
    unit: 'count',
  },
  {
    key: 'veterinary_facilities_count',
    label: 'Veterinary Facilities',
    unit: 'count',
  },
  {
    key: 'feed_imports_tons',
    label: 'Feed Imports',
    unit: 'tons',
  },
  {
    key: 'local_feed_production_tons',
    label: 'Local Feed Production',
    unit: 'tons',
  },
  {
    key: 'livestock_exports_tons',
    label: 'Livestock Exports',
    unit: 'tons',
  },
  {
    key: 'offtake_rate_pct',
    label: 'Offtake Rate',
    unit: '%',
  },
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

function getVariablesForSector(
  sector: SectorKey
): VariableDefinition[] {
  return sector === 'agricultural_inputs'
    ? AGRICULTURAL_INPUT_VARIABLES
    : LIVESTOCK_VARIABLES;
}

function isNumericValue(
  value: unknown
): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatChartValue(value: unknown): string {
  if (!isNumericValue(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SectorComparisonTrend({
  filters,
  onFiltersChange,
}: SectorComparisonTrendProps) {
  const supabase = useMemo(() => createClient(), []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [userCountryId, setUserCountryId] = useState<number | null>(
    null
  );

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
          length:
            DATA_END_YEAR - DATA_START_YEAR + 1,
        },
        (_, index) => DATA_START_YEAR + index
      ),
    []
  );

  const availableVariables = useMemo(
    () => getVariablesForSector(filters.sector),
    [filters.sector]
  );

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
    (
      updates: Partial<SectorExplorerFilters>
    ) => {
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
        setError(
          'You must be logged in to view sector comparisons.'
        );
        return;
      }

      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from('admin_profiles')
        .select('id, role, status')
        .eq('id', user.id)
        .eq('status', 'active')
        .in('role', ['admin', 'super_admin'])
        .maybeSingle<AdminProfile>();

      if (adminError) {
        throw adminError;
      }

      const userIsAdmin = Boolean(adminProfile);

      setIsAdmin(userIsAdmin);

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

      if (userIsAdmin) {
        setCountries(loadedCountries);

        if (filters.countryIds.length === 0) {
          if (loadedCountries.length > 0) {
            onFiltersChange({
              ...filters,
              countryIds: [loadedCountries[0].id],
            });
          }
        }
      } else {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select('country')
          .eq('id', user.id)
          .maybeSingle<Profile>();

        if (profileError) {
          throw profileError;
        }

        const profileCountry =
          profile?.country ?? null;

        const matchedCountry =
          loadedCountries.find(
            (country) =>
              country.name.toLowerCase() ===
              profileCountry?.toLowerCase()
          );

        if (!matchedCountry) {
          setCountries([]);
          setUserCountryId(null);

          setError(
            'Your profile country could not be matched to the available dataset.'
          );

          return;
        }

        setCountries([matchedCountry]);
        setUserCountryId(matchedCountry.id);

        if (
          filters.countryIds.length !== 1 ||
          filters.countryIds[0] !== matchedCountry.id
        ) {
          onFiltersChange({
            ...filters,
            countryIds: [matchedCountry.id],
          });
        }
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load sector comparison filters.';

      setError(message);
    } finally {
      setLoadingMetadata(false);
    }
  }, [
    filters,
    onFiltersChange,
    supabase,
  ]);

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

    if (validVariables.length === 0) {
      updateFilters({
        variables: [availableVariables[0].key],
      });

      setChartData([]);
      return;
    }

    if (
      validVariables.length !== filters.variables.length
    ) {
      updateFilters({
        variables: validVariables,
      });
    }

    setChartData([]);
  }, [
    availableVariables,
    filters.variables,
    updateFilters,
  ]);

  useEffect(() => {
    if (
      !isAdmin &&
      userCountryId !== null &&
      (filters.countryIds.length !== 1 ||
        filters.countryIds[0] !== userCountryId)
    ) {
      updateFilters({
        countryIds: [userCountryId],
      });
    }
  }, [
    filters.countryIds,
    isAdmin,
    updateFilters,
    userCountryId,
  ]);

  const toggleCountry = (
    countryIdToToggle: number
  ) => {
    if (!isAdmin) {
      return;
    }

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
      countryIds: [
        ...currentCountryIds,
        countryIdToToggle,
      ],
    });
  };

  const toggleVariable = (
    variableKey: string
  ) => {
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
      variables: [
        ...currentVariables,
        variableKey,
      ],
    });
  };

  const selectAllCountries = () => {
    if (!isAdmin) {
      return;
    }

    updateFilters({
      countryIds: countries.map(
        (country) => country.id
      ),
    });
  };

  const clearAdditionalCountries = () => {
    if (!isAdmin || countries.length === 0) {
      return;
    }

    updateFilters({
      countryIds: [countries[0].id],
    });
  };

  const handleStartYearChange = (
    value: number
  ) => {
    updateFilters({
      startYear: value,
      endYear:
        value > filters.endYear
          ? value
          : filters.endYear,
    });
  };

  const handleEndYearChange = (
    value: number
  ) => {
    updateFilters({
      endYear: value,
      startYear:
        value < filters.startYear
          ? value
          : filters.startYear,
    });
  };

  const handleSectorChange = (
    value: SectorKey
  ) => {
    const nextVariables =
      getVariablesForSector(value);

    updateFilters({
      sector: value,
      variables: [
        nextVariables[0].key,
      ],
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
        filters.sector ===
        'agricultural_inputs'
          ? 'agricultural_inputs'
          : 'livestock_data';

      const selectedColumns = [
        'id',
        'country_id',
        'year',
        ...filters.variables,
      ].join(', ');

      const {
        data,
        error: queryError,
      } = await supabase
        .from(tableName)
        .select(selectedColumns)
        .in(
          'country_id',
          filters.countryIds
        )
        .gte(
          'year',
          filters.startYear
        )
        .lte(
          'year',
          filters.endYear
        )
        .order('year', {
          ascending: true,
        });

      if (queryError) {
        throw queryError;
      }

      const records =
        (data ?? []) as unknown as DataRecord[];

      const rows =
        new Map<number, ChartRow>();

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

        filters.variables.forEach(
          (variableKey) => {
            const value =
              record[variableKey];

            if (!isNumericValue(value)) {
              return;
            }

            const seriesKey =
              `${record.country_id}_${variableKey}`;

            row[seriesKey] = value;
          }
        );
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
          : 'Unable to load comparison data.';

      setError(message);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [
    filters,
    supabase,
  ]);

  useEffect(() => {
    if (loadingMetadata) {
      return;
    }

    void loadChartData();
  }, [
    loadChartData,
    loadingMetadata,
  ]);

  const chartSeries = useMemo(() => {
    const series: Array<{
      dataKey: string;
      label: string;
      color: string;
      variable: VariableDefinition;
      countryName: string;
    }> = [];

    let colorIndex = 0;

    filters.countryIds.forEach(
      (selectedId) => {
        const countryName =
          countryNameMap.get(selectedId) ??
          `Country ${selectedId}`;

        filters.variables.forEach(
          (variableKey) => {
            const variable =
              availableVariables.find(
                (item) =>
                  item.key ===
                  variableKey
              );

            if (!variable) {
              return;
            }

            series.push({
              dataKey:
                `${selectedId}_${variableKey}`,
              label:
                `${countryName} — ${variable.label}`,
              color:
                CHART_COLORS[
                  colorIndex %
                    CHART_COLORS.length
                ],
              variable,
              countryName,
            });

            colorIndex += 1;
          }
        );
      }
    );

    return series;
  }, [
    availableVariables,
    countryNameMap,
    filters.countryIds,
    filters.variables,
  ]);

  if (loadingMetadata) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>
            Loading sector comparison...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--dark-green)] via-[#005f00] to-[#003d00] px-5 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Filter className="h-5 w-5" />

              <span className="text-sm font-semibold uppercase tracking-wider text-green-100">
                Sector Data Explorer
              </span>
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">
              Compare Sector Trends
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-green-50">
              Compare countries, select a year
              range, and explore different
              sector variables from the
              2006–2025 dataset.
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <p className="text-green-100">
              Dataset period
            </p>

            <p className="mt-1 font-bold">
              {DATA_START_YEAR} – {DATA_END_YEAR}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50/80 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Country */}
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Country
            </label>

            {isAdmin ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCountryDropdownOpen(
                      (current) => !current
                    )
                  }
                  className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-sm shadow-sm transition hover:border-[var(--dark-green)]"
                >
                  <span className="truncate text-gray-700">
                    {selectedCountries.length === 0
                      ? 'Select countries'
                      : selectedCountries.length ===
                        1
                        ? selectedCountries[0].name
                        : `${selectedCountries.length} countries selected`}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      countryDropdownOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />
                </button>

                {countryDropdownOpen && (
                  <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-2 pb-2">
                      <button
                        type="button"
                        onClick={
                          selectAllCountries
                        }
                        className="text-xs font-semibold text-[var(--dark-green)] hover:underline"
                      >
                        Select all
                      </button>

                      <button
                        type="button"
                        onClick={
                          clearAdditionalCountries
                        }
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Reset
                      </button>
                    </div>

                    {countries.map(
                      (country) => {
                        const selected =
                          filters.countryIds.includes(
                            country.id
                          );

                        return (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() =>
                              toggleCountry(
                                country.id
                              )
                            }
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
                      }
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[46px] items-center rounded-xl border border-gray-200 bg-gray-100 px-4 text-sm font-medium text-gray-700">
                {selectedCountries[0]?.name ??
                  'Your country'}
              </div>
            )}
          </div>

          {/* Start Year */}
          <div>
            <label
              htmlFor="sector-start-year"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Start Year
            </label>

            <select
              id="sector-start-year"
              value={filters.startYear}
              onChange={(event) =>
                handleStartYearChange(
                  Number(event.target.value)
                )
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* End Year */}
          <div>
            <label
              htmlFor="sector-end-year"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              End Year
            </label>

            <select
              id="sector-end-year"
              value={filters.endYear}
              onChange={(event) =>
                handleEndYearChange(
                  Number(event.target.value)
                )
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label
              htmlFor="sector-select"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Sector
            </label>

            <select
              id="sector-select"
              value={filters.sector}
              onChange={(event) =>
                handleSectorChange(
                  event.target.value as SectorKey
                )
              }
              className="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--dark-green)] focus:ring-2 focus:ring-[var(--dark-green)]/10"
            >
              <option value="agricultural_inputs">
                Agricultural Inputs
              </option>

              <option value="livestock">
                Livestock
              </option>
            </select>
          </div>
        </div>

        {/* Variables */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Variables
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setVariableDropdownOpen(
                  (current) => !current
                )
              }
              className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-left text-sm shadow-sm transition hover:border-[var(--dark-green)]"
            >
              <span className="truncate text-gray-700">
                {selectedVariableLabels.length ===
                1
                  ? selectedVariableLabels[0]
                  : `${selectedVariableLabels.length} variables selected`}
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${
                  variableDropdownOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />
            </button>

            {variableDropdownOpen && (
              <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                {availableVariables.map(
                  (variable) => {
                    const selected =
                      filters.variables.includes(
                        variable.key
                      );

                    return (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() =>
                          toggleVariable(
                            variable.key
                          )
                        }
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
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            Active filters:
          </span>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            {filters.startYear}–
            {filters.endYear}
          </span>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            {filters.sector ===
            'agricultural_inputs'
              ? 'Agricultural Inputs'
              : 'Livestock'}
          </span>

          {selectedCountries.length > 0 && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
              {selectedCountries.length}{' '}
              {selectedCountries.length === 1
                ? 'country'
                : 'countries'}
            </span>
          )}

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {filters.variables.length}{' '}
            {filters.variables.length === 1
              ? 'variable'
              : 'variables'}
          </span>
        </div>
      </div>

      {/* Chart */}
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
              Loading comparison data...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
            <div>
              <p className="font-semibold text-gray-700">
                No comparison data available
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try selecting another country,
                year range, sector, or variable.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {filters.sector ===
                  'agricultural_inputs'
                    ? 'Agricultural Inputs'
                    : 'Livestock'}{' '}
                  Trends
                </h3>

                <p className="text-sm text-gray-500">
                  {filters.startYear}–
                  {filters.endYear} ·{' '}
                  {selectedCountries.length}{' '}
                  {selectedCountries.length ===
                  1
                    ? 'country'
                    : 'countries'}{' '}
                  · {filters.variables.length}{' '}
                  {filters.variables.length ===
                  1
                    ? 'variable'
                    : 'variables'}
                </p>
              </div>

              <div className="text-xs text-gray-400">
                {chartData.length} years displayed
              </div>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 5,
                    bottom: 10,
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
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{
                      stroke: '#D1D5DB',
                    }}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat(
                        'en-US',
                        {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }
                      ).format(value)
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border:
                        '1px solid #E5E7EB',
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
                      const series =
                        chartSeries.find(
                          (item) =>
                            item.dataKey ===
                            String(name)
                        );

                      return [
                        formatChartValue(value),
                        series?.label ??
                          String(name),
                      ];
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      paddingTop: '15px',
                      fontSize: '12px',
                    }}
                  />

                  {chartSeries.map(
                    (series) => (
                      <Line
                        key={series.dataKey}
                        type="monotone"
                        dataKey={series.dataKey}
                        name={`${series.countryName} — ${series.variable.label}`}
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
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Interpretation note */}
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs leading-5 text-amber-800">
                <strong>
                  Interpretation note:
                </strong>{' '}
                Variables may use different units,
                such as tons, percentages, head,
                USD, or hectares. When multiple
                variables are selected, use the
                chart primarily to compare their
                trends rather than directly
                comparing their absolute
                magnitudes.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
