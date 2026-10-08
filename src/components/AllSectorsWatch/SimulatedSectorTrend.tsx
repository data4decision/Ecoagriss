// components/dashboard/SimulatedSectorTrend.tsx
'use client';

import { useMemo } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { SectorExplorerFilters } from './SectorComparisonTrend';

interface SimulatedSectorTrendProps {
  filters: SectorExplorerFilters;
}

const CHART_COLORS = [
  '#0B6B3A', '#F47B20', '#2563EB', '#9333EA', '#DC2626',
  '#0891B2', '#CA8A04', '#4F46E5', '#059669', '#DB2777',
];

// Deterministic pseudo-random so the chart doesn't flicker on every render
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function SimulatedSectorTrend({ filters }: SimulatedSectorTrendProps) {
  const chartData = useMemo(() => {
    const rows: Array<Record<string, number>> = [];
    const range = filters.endYear - filters.startYear + 1;

    for (let i = 0; i < range; i++) {
      const year = filters.startYear + i;
      const row: Record<string, number> = { year };

      filters.countryIds.forEach((countryId) => {
        filters.variables.forEach((variableKey) => {
          const seed = countryId * 1000 + variableKey.length * 10 + i;
          const base = 5000 + seededRandom(seed) * 95000;
          const trend = i * (200 + seededRandom(seed + 1) * 800);
          const seasonal = Math.sin(i / 2 + seededRandom(seed + 2) * 3) * 1200;
          const noise = (seededRandom(seed + 3) - 0.5) * 3000;

          row[`${countryId}_${variableKey}`] = Math.max(0, Math.round(base + trend + seasonal + noise));
        });
      });

      rows.push(row);
    }
    return rows;
  }, [filters.countryIds, filters.variables, filters.startYear, filters.endYear]);

  const chartSeries = useMemo(() => {
    const series: Array<{ dataKey: string; label: string; color: string }> = [];
    let colorIndex = 0;

    filters.countryIds.forEach((countryId) => {
      filters.variables.forEach((variableKey) => {
        series.push({
          dataKey: `${countryId}_${variableKey}`,
          label: `Country ${countryId} — ${variableKey.replace(/_/g, ' ')}`,
          color: CHART_COLORS[colorIndex % CHART_COLORS.length],
        });
        colorIndex += 1;
      });
    });
    return series;
  }, [filters.countryIds, filters.variables]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Simulated Sector Trends</h3>
          <p className="text-sm text-gray-500">
            {filters.startYear}–{filters.endYear} · {filters.countryIds.length} countries · {filters.variables.length} variables
          </p>
        </div>
        <div className="text-xs text-gray-400">{chartData.length} years displayed</div>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 5, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#D1D5DB' }} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#D1D5DB' }}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
              }
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
              labelStyle={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}
              formatter={(value: unknown, name: unknown) => {
                const series = chartSeries.find((item) => item.dataKey === String(name));
                return [new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value as number), series?.label ?? String(name)];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
            {chartSeries.map((series) => (
              <Line
                key={series.dataKey}
                type="monotone"
                dataKey={series.dataKey}
                name={series.label}
                stroke={series.color}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs leading-5 text-amber-800">
          <strong>Simulation note:</strong> This view shows synthetic (simulated) data for demonstration purposes only. It does not represent real observations. Use the "Real Data" toggle to view the actual dataset.
        </p>
      </div>
    </div>
  );
}