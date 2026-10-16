'use client';

import React, { useRef, useState } from 'react';
import CrossSectorSnapshot from './CrossSectorSnapshot';
import SectorComparisonTrend, {
  type SectorExplorerFilters,
} from './SectorComparisonTrend';
import IntelligenceHighlights from './IntelligenceHighlights';
import PredictiveAnalysis from './PredictiveAnalysis';
import ExportButtons from './ExportButtons';

const DEFAULT_FILTERS: SectorExplorerFilters = {
  countryIds: [],
  startYear: 2006,
  endYear: 2025,
  sector: 'agricultural_inputs',
  variables: ['cereal_seeds_tons'],
};

const RealDataCrossSectorSnapshot = () => {
  const [selectedCountryId] = useState<number | null>(null);

  const [filters, setFilters] =
    useState<SectorExplorerFilters>(DEFAULT_FILTERS);

  const chartRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const predictiveRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      

      <CrossSectorSnapshot countryId={selectedCountryId} />

      <div ref={chartRef} className="overflow-visible bg-white">
        <SectorComparisonTrend
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      <ExportButtons
        filters={filters}
        chartRef={chartRef}
        intelligenceRef={intelligenceRef}
        predictiveRef={predictiveRef}
      />

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