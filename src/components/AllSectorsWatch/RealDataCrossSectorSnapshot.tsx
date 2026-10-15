'use client';

import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { createClient } from '@/lib/supabase/client';
import CrossSectorSnapshot from './CrossSectorSnapshot';
import SectorComparisonTrend, {
  type SectorExplorerFilters,
} from './SectorComparisonTrend';
import IntelligenceHighlights from './IntelligenceHighlights';
import PredictiveAnalysis from './PredictiveAnalysis';

const DEFAULT_FILTERS: SectorExplorerFilters = {
  countryIds: [],
  startYear: 2006,
  endYear: 2025,
  sector: 'agricultural_inputs',
  variables: ['cereal_seeds_tons'],
};

/** Friendly labels for CSV headers (key → label) */
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

const RealDataCrossSectorSnapshot = () => {
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
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
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

    const ratio = contentWidth / imgWidth;
    const scaledWidth = contentWidth;
    const scaledHeight = imgHeight * ratio;

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

  /** Capture a section and add it as a new PDF page (skips first page add) */
  const addSectionToPdf = async (
    pdf: jsPDF,
    element: HTMLElement | null,
    title: string,
    isFirstPage: boolean
  ) => {
    if (!element) return isFirstPage;

    if (!isFirstPage) {
      pdf.addPage();
    }

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

  // ── PDF: Chart + Intelligence + Predictive ────────────────
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
        'Sector Comparison Chart',
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
      pdf.save(`ecoagris-sector-report-${date}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download the PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // ── PNG: Chart + Intelligence + Predictive ────────────────
    // ── PNG: one file = Chart + Intelligence + Predictive ─────
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
      // Wait until AI interpretation has finished (no "Generating interpretation...")
      const waitForInterpretation = async (
        element: HTMLElement,
        maxMs = 45000
      ) => {
        const start = Date.now();
        while (Date.now() - start < maxMs) {
          const text = element.innerText || element.textContent || '';
          if (!/generating interpretation/i.test(text)) {
            // Extra pause so the final text can paint
            await wait(600);
            return;
          }
          await wait(400);
        }
        // Timed out — still capture whatever is on screen
      };

      if (predictiveRef.current) {
        await waitForInterpretation(predictiveRef.current);
      }

      // Capture each section
      const sections: { dataUrl: string; label: string }[] = [];

      if (chartRef.current) {
        sections.push({
          dataUrl: await captureElement(chartRef.current),
          label: 'chart',
        });
      }
      if (intelligenceRef.current) {
        sections.push({
          dataUrl: await captureElement(intelligenceRef.current),
          label: 'intelligence',
        });
      }
      if (predictiveRef.current) {
        sections.push({
          dataUrl: await captureElement(predictiveRef.current),
          label: 'predictive',
        });
      }

      if (sections.length === 0) return;

      // Load images
      const images = await Promise.all(
        sections.map(
          (s) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = s.dataUrl;
            })
        )
      );

      // Stitch vertically into one PNG
      const gap = 24; // space between sections (px)
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

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = padding;
      for (const img of images) {
        const x = padding + (maxWidth - img.width) / 2;
        ctx.drawImage(img, x, y, img.width, img.height);
        y += img.height + gap;
      }

      const combinedDataUrl = canvas.toDataURL('image/png', 1.0);
      const date = new Date().toISOString().slice(0, 10);
      triggerDownload(
        combinedDataUrl,
        `ecoagris-sector-full-${date}.png`
      );
    } catch (error) {
      console.error('Failed to generate PNG:', error);
      alert('Failed to download the PNG. Please try again.');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  // ── CSV (filtered data) ───────────────────────────────────
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

      // Cast through unknown to avoid GenericStringError[] type error
      const records = (data ?? []) as unknown as Array<
        Record<string, unknown>
      >;

      const { data: countryRows } = await supabase
        .from('countries')
        .select('id, name')
        .in('id', filters.countryIds);

      const countryMap = new Map<number, string>();
      ((countryRows ?? []) as Array<{ id: number; name: string }>).forEach(
        (c) => {
          countryMap.set(c.id, c.name);
        }
      );

      const headers = [
        'Country',
        'Year',
        ...filters.variables.map(
          (key) => VARIABLE_LABELS[key] ?? key
        ),
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
        `ecoagris-${sectorSlug}-${filters.startYear}-${filters.endYear}-${date}.csv`
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
      {/* Export buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2 px-4 sm:gap-3 sm:px-6">
        {/* CSV */}
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
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </>
          )}
        </button>

        {/* PNG */}
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
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Download PNG
            </>
          )}
        </button>

        {/* PDF */}
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
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      <CrossSectorSnapshot countryId={selectedCountryId} />

      <div ref={chartRef} className="overflow-visible bg-white">
        <SectorComparisonTrend
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div ref={intelligenceRef} className="overflow-visible bg-white">
        <IntelligenceHighlights filters={filters} />
      </div>

      <div ref={predictiveRef} className="overflow-visible bg-white">
        <PredictiveAnalysis filters={filters} />
      </div>
    </div>
  );
};

export default RealDataCrossSectorSnapshot;