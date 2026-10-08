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
import Footer from '@/components/Footer';
import SimpleNavbar from '@/components/SimpleNavbar';



export default function AllSectorsWatchPage() {
 

  return (
    <main className="space-y-1">
      <SimpleNavbar/>
      <AllSectorsWatchHero />

      {/* <CountryFilterAdmin
        selectedCountryId={selectedCountryId}
        onCountryChange={setSelectedCountryId}
      /> */}

      {/* <DataCoverageCards countryId={selectedCountryId} /> */}

      {/* <SectorCards countryId={selectedCountryId} /> */}
       <Footer/>
      

      
    </main>
  );
}