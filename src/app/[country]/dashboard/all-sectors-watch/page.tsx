'use client';

import { useState } from 'react';

import AllSectorsWatchHero from '@/components/AllSectorsWatch/AllSectorsWatchHero';
import CountryFilterAdmin from '@/components/AllSectorsWatch/CountryFilterAdmin';
import DataCoverageCards from '@/components/AllSectorsWatch/DataCoverageCards';
import SectorCards from '@/components/AllSectorsWatch/SectorCards';
import CrossSectorSnapshot from '@/components/AllSectorsWatch/CrossSectorSnapshot';
import SectorComparisonTrend, {
  type SectorExplorerFilters,
} from '@/components/AllSectorsWatch/SectorComparisonTrend';
import IntelligenceHighlights from '@/components/AllSectorsWatch/IntelligenceHighlights';

const DEFAULT_FILTERS: SectorExplorerFilters = {
  countryIds: [],
  startYear: 2006,
  endYear: 2025,
  sector: 'agricultural_inputs',
  variables: ['cereal_seeds_tons'],
};

export default function AllSectorsWatchPage() {
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );

  // Shared by SectorComparisonTrend + IntelligenceHighlights
  const [filters, setFilters] =
    useState<SectorExplorerFilters>(DEFAULT_FILTERS);

  return (
    <main className="space-y-6">
      <AllSectorsWatchHero />

      <CountryFilterAdmin
        selectedCountryId={selectedCountryId}
        onCountryChange={setSelectedCountryId}
      />

      <DataCoverageCards countryId={selectedCountryId} />

      <SectorCards countryId={selectedCountryId} />

      <CrossSectorSnapshot countryId={selectedCountryId} />

      <SectorComparisonTrend
        filters={filters}
        onFiltersChange={setFilters}
      />

      <IntelligenceHighlights filters={filters} />
    </main>
  );
}