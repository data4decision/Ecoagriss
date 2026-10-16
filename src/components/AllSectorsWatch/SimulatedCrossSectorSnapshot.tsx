'use client';

import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { createClient } from '@/lib/supabase/client';
import CrossSectorSnapshot from './CrossSectorSnapshot';
import SimulatedSectorTrend from './SimulatedSectorTrend';
import type { SectorExplorerFilters } from './SectorComparisonTrend';
import IntelligenceHighlights from './IntelligenceHighlights';
import PredictiveAnalysis from './PredictiveAnalysis';

const DEFAULT_FILTERS: SectorExplorerFilters = {
  countryIds: [],
  startYear: 2006,
  endYear: 2025,
  sector: 'agricultural_inputs',
  variables: ['cereal_seeds_tons'],
};

const VARIABLE_LABELS: Record<string, string> = {
  cereal_seeds_tons: 'Cereal Seeds (tons)',
  fertilizer_tons: 'Fertilizer (tons)',
  pesticide_liters: 'Pesticide (litres)',
  improved_seed_use_pct: 'Improved Seed Use (%)',
  fertilizer_kg_per_ha: 'Fertilizer (kg/ha)',
  input_price_index_2006_base: 'Input Price Index (2006 base)',
  agro_dealer_count: 'Agro-dealer Count',
  input_subsidy_budget_usd: 'Input Subsidy Budget (USD)',
  distribution_timeliness_pct: 'Distribution Timeliness (%)',
  stockouts_days_per_year: 'Stockouts (days/year)',
  input_import_value_usd: 'Input Import Value (USD)',
  local_production_inputs_tons: 'Local Input Production (tons)',
  mechanization_units_per_1000_farms: 'Mechanization (units/1,000 farms)',
  credit_access_pct: 'Credit Access (%)',
  cattle_head: 'Cattle Population (head)',
  small_ruminants_head: 'Small Ruminants (head)',
  pigs_head: 'Pig Population (head)',
  poultry_head: 'Poultry Population (head)',
  milk_production_tons: 'Milk Production (tons)',
  meat_production_tons: 'Meat Production (tons)',
  livestock_price_index_2006_base: 'Livestock Price Index (2006 base)',
  vaccination_coverage_pct: 'Vaccination Coverage (%)',
  fmd_incidents_count: 'FMD Incidents (count)',
  grazing_area_ha: 'Grazing Area (ha)',
  transhumance_events: 'Transhumance Events (count)',
  veterinary_facilities_count: 'Veterinary Facilities (count)',
  feed_imports_tons: 'Feed Imports (tons)',
  local_feed_production_tons: 'Local Feed Production (tons)',
  livestock_exports_tons: 'Livestock Exports (tons)',
  offtake_rate_pct: 'Offtake Rate (%)',
};

const SimulatedCrossSectorSnapshot = () => {
  const [selectedCountryId] = useState<number | null>(null);
  const [filters, setFilters] =
    useState<SectorExplorerFilters>(DEFAULT_FILTERS);

  const chartRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const predictiveRef = useRef<HTMLDivElement>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const captureElement = async (element: HTMLElement): Promise<string> => {
    const originalWidth = element.style.width;
    const originalOverflow = element.style.overflow;

    element.style.width = `${element.scrollWidth}px`;
    element.style.overflow = 'visible';
    await wait(400);

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: { transform: 'scale(1)', transformOrigin: 'top left' },
      filter: (node) => {
        if (node instanceof HTMLElement) {
          const tag = node.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style') return false;
        }
        return true;
      },
    });

    element.style.width = originalWidth;
    element.style.overflow = originalOverflow;
    return dataUrl;
  };

  const addImageToPdf = (
    pdf: jsPDF,
    imgData: string,
    imgWidth: number,
    imgHeight: number,
    title: string
  ) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const scaledWidth = contentWidth;
    const scaledHeight = imgHeight * (contentWidth / imgWidth);

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text(title, margin, margin + 5);

    const y = margin + 12;
    const availableHeight = pageHeight - y - margin;

    if (scaledHeight <= availableHeight) {
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        y,
        scaledWidth,
        scaledHeight,
        undefined,
        'FAST'
      );
      return;
    }

    const fitRatio = availableHeight / scaledHeight;
    const finalWidth = scaledWidth * fitRatio;
    const finalHeight = availableHeight;
    const x = margin + (contentWidth - finalWidth) / 2;

    pdf.addImage(
      imgData,
      'PNG',
      x,
      y,
      finalWidth,
      finalHeight,
      undefined,
      'FAST'
    );
  };

  const triggerDownload = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addSectionToPdf = async (
    pdf: jsPDF,
    element: HTMLElement | null,
    title: string,
    isFirstPage: boolean
  ) => {
    if (!element) return isFirstPage;
    if (!isFirstPage) pdf.addPage();

    const imgData = await captureElement(element);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imgData;
    });

    addImageToPdf(pdf, imgData, img.width, img.height, title);
    return false;
  };

  // ── PDF ───────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (
      !chartRef.current &&
      !intelligenceRef.current &&
      !predictiveRef.current
    ) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      let isFirstPage = true;
      isFirstPage = await addSectionToPdf(
        pdf,
        chartRef.current,
        'Simulated Sector Comparison Chart',
        isFirstPage
      );
      isFirstPage = await addSectionToPdf(
        pdf,
        intelligenceRef.current,
        'Intelligence Highlights',
        isFirstPage
      );
      await addSectionToPdf(
        pdf,
        predictiveRef.current,
        'Predictive Analysis',
        isFirstPage
      );

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`ecoagris-simulated-report-${date}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download the PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // ── PNG (single combined file) ────────────────────────────
  const handleDownloadPNG = async () => {
    if (
      !chartRef.current &&
      !intelligenceRef.current &&
      !predictiveRef.current
    ) {
      return;
    }

    setIsDownloadingPng(true);
    try {
      const waitForInterpretation = async (
        element: HTMLElement,
        maxMs = 45000
      ) => {
        const start = Date.now();
        while (Date.now() - start < maxMs) {
          const text = element.innerText || element.textContent || '';
          if (!/generating interpretation/i.test(text)) {
            await wait(600);
            return;
          }
          await wait(400);
        }
      };

      if (predictiveRef.current) {
        await waitForInterpretation(predictiveRef.current);
      }

      const sections: string[] = [];
      if (chartRef.current) {
        sections.push(await captureElement(chartRef.current));
      }
      if (intelligenceRef.current) {
        sections.push(await captureElement(intelligenceRef.current));
      }
      if (predictiveRef.current) {
        sections.push(await captureElement(predictiveRef.current));
      }
      if (sections.length === 0) return;

      const images = await Promise.all(
        sections.map(
          (dataUrl) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = dataUrl;
            })
        )
      );

      const gap = 24;
      const padding = 16;
      const maxWidth = Math.max(...images.map((img) => img.width));
      const totalHeight =
        images.reduce((sum, img) => sum + img.height, 0) +
        gap * (images.length - 1) +
        padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth + padding * 2;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = padding;
      for (const img of images) {
        const x = padding + (maxWidth - img.width) / 2;
        ctx.drawImage(img, x, y, img.width, img.height);
        y += img.height + gap;
      }

      const date = new Date().toISOString().slice(0, 10);
      triggerDownload(
        canvas.toDataURL('image/png', 1.0),
        `ecoagris-simulated-full-${date}.png`
      );
    } catch (error) {
      console.error('Failed to generate PNG:', error);
      alert('Failed to download the PNG. Please try again.');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  // ── CSV ───────────────────────────────────────────────────
  // Uses same tables as real data so export matches current filters.
  // If SimulatedSectorTrend uses pure dummy data only, swap this to
  // read from that component's data source instead.
  const handleExportCSV = async () => {
    if (
      filters.countryIds.length === 0 ||
      filters.variables.length === 0 ||
      filters.startYear > filters.endYear
    ) {
      alert(
        'Please select at least one country and one variable before exporting.'
      );
      return;
    }

    setIsExportingCsv(true);
    try {
      const tableName =
        filters.sector === 'agricultural_inputs'
          ? 'agricultural_inputs'
          : 'livestock_data';

      const selectedColumns = [
        'country_id',
        'year',
        ...filters.variables,
      ].join(', ');

      const { data, error } = await supabase
        .from(tableName)
        .select(selectedColumns)
        .in('country_id', filters.countryIds)
        .gte('year', filters.startYear)
        .lte('year', filters.endYear)
        .order('year', { ascending: true })
        .order('country_id', { ascending: true });

      if (error) throw error;

      const records = (data ?? []) as unknown as Array<
        Record<string, unknown>
      >;

      const { data: countryRows } = await supabase
        .from('countries')
        .select('id, name')
        .in('id', filters.countryIds);

      const countryMap = new Map<number, string>();
      ((countryRows ?? []) as Array<{ id: number; name: string }>).forEach(
        (c) => countryMap.set(c.id, c.name)
      );

      const headers = [
        'Country',
        'Year',
        ...filters.variables.map((key) => VARIABLE_LABELS[key] ?? key),
        'Data Type',
      ];

      const escapeCsv = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = records.map((row) => {
        const countryName =
          countryMap.get(Number(row.country_id)) ??
          `Country ${row.country_id}`;

        return [
          escapeCsv(countryName),
          escapeCsv(row.year),
          ...filters.variables.map((key) => escapeCsv(row[key])),
          'Simulated',
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const sectorSlug =
        filters.sector === 'agricultural_inputs'
          ? 'agricultural-inputs'
          : 'livestock';

      triggerDownload(
        url,
        `ecoagris-simulated-${sectorSlug}-${filters.startYear}-${filters.endYear}-${date}.csv`
      );
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const anyBusy =
    isDownloadingPdf || isDownloadingPng || isExportingCsv;

  return (
    <div>
      

      {/* Snapshot table (dummy coverage) — no filters needed */}
      <CrossSectorSnapshot countryId={selectedCountryId} />

{/* <div ref={chartRef} className="overflow-visible bg-white">
  <SimulatedSectorTrend filters={filters} />
</div>
{/* Export buttons */}
      {/* <div className="mb-4 flex flex-wrap items-center justify-end gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={anyBusy}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExportingCsv ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              Exporting CSV...
            </>
          ) : (
            <>Export CSV</>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={anyBusy}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloadingPng ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              Generating PNG...
            </>
          ) : (
            <>Download PNG</>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={anyBusy}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--dark-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004d00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloadingPdf ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating PDF...
            </>
          ) : (
            <>Download PDF</>
          )}
        </button>
      </div> */}
{/* <div ref={intelligenceRef} className="overflow-visible bg-white">
  <IntelligenceHighlights filters={filters} />
</div> */}

{/* <div ref={predictiveRef} className="overflow-visible bg-white">
  <PredictiveAnalysis filters={filters} />
</div>  */}
</div>
  );
};

export default SimulatedCrossSectorSnapshot;