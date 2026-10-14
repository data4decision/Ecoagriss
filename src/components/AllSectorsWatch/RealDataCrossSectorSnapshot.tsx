'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
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

const RealDataCrossSectorSnapshot = () => {
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );

  const [filters, setFilters] =
    useState<SectorExplorerFilters>(DEFAULT_FILTERS);

  const chartRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper: wait a bit so Recharts finishes rendering
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Helper: capture an element as high-quality PNG
  const captureElement = async (element: HTMLElement): Promise<string> => {
    // Temporarily force a clean layout for capture
    const originalWidth = element.style.width;
    const originalOverflow = element.style.overflow;

    // Give the chart a stable width so ResponsiveContainer doesn't clip
    element.style.width = `${element.scrollWidth}px`;
    element.style.overflow = 'visible';

    // Wait for Recharts to re-render at the new size
    await wait(400);

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 3, // high quality
      backgroundColor: '#ffffff',
      cacheBust: true,
      // Include extra space so lines/legend are not clipped
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
      filter: (node) => {
        // Skip anything that might cause issues
        if (node instanceof HTMLElement) {
          const tag = node.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style') return false;
        }
        return true;
      },
    });

    // Restore original styles
    element.style.width = originalWidth;
    element.style.overflow = originalOverflow;

    return dataUrl;
  };

  // Helper: add an image to the PDF, splitting across pages if needed
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

    // Scale image to fit page width
    const ratio = contentWidth / imgWidth;
    const scaledWidth = contentWidth;
    const scaledHeight = imgHeight * ratio;

    // Title
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text(title, margin, margin + 5);

    let y = margin + 12;
    let remainingHeight = scaledHeight;
    let sourceY = 0; // for slicing (simple approach: scale down if too tall)

    // If the image fits on one page
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

    // Image is taller than one page → scale it to fit the page
    // (keeps the full chart visible without cutting lines)
    const fitRatio = availableHeight / scaledHeight;
    const finalWidth = scaledWidth * fitRatio;
    const finalHeight = availableHeight;

    // Center horizontally if scaled down
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

  const handleDownloadPDF = async () => {
    if (!chartRef.current && !intelligenceRef.current) return;

    setIsDownloading(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // ── 1. Capture Chart ───────────────────────────────────
      if (chartRef.current) {
        const chartImg = await captureElement(chartRef.current);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = chartImg;
        });

        addImageToPdf(
          pdf,
          chartImg,
          img.width,
          img.height,
          'Sector Comparison Chart'
        );
      }

      // ── 2. Capture Intelligence section ────────────────────
      if (intelligenceRef.current) {
        pdf.addPage();

        const intelImg = await captureElement(intelligenceRef.current);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = intelImg;
        });

        addImageToPdf(
          pdf,
          intelImg,
          img.width,
          img.height,
          'Intelligence Highlights'
        );
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`ecoagris-sector-report-${date}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download the report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {/* Download button */}
      <div className="mb-4 flex justify-end px-4 sm:px-6">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--dark-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004d00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading ? (
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
              Download Chart & Intelligence
            </>
          )}
        </button>
      </div>

      <CrossSectorSnapshot countryId={selectedCountryId} />

      {/* Important: overflow-visible so lines are not clipped */}
      <div ref={chartRef} className="overflow-visible bg-white">
        <SectorComparisonTrend
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div ref={intelligenceRef} className="overflow-visible bg-white">
        <IntelligenceHighlights filters={filters} />
      </div>
      {/* <PredictiveAnalysis filters={filters} /> */}
    </div>
  );
};

export default RealDataCrossSectorSnapshot;