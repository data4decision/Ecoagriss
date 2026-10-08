import React, { useState } from 'react'
import CrossSectorSnapshot from './CrossSectorSnapshot'
import SectorComparisonTrend, { type SectorExplorerFilters } from './SectorComparisonTrend'
import IntelligenceHighlights from './IntelligenceHighlights'

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
    
      // Shared by SectorComparisonTrend + IntelligenceHighlights
      const [filters, setFilters] =
        useState<SectorExplorerFilters>(DEFAULT_FILTERS);

  return (
    <div>
       <CrossSectorSnapshot countryId={selectedCountryId} />
       <SectorComparisonTrend
        filters={filters}
        onFiltersChange={setFilters}
      />

      <IntelligenceHighlights filters={filters} />
  
    </div>
  )
}

export default RealDataCrossSectorSnapshot