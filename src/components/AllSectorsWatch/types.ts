export type SectorKey = 'agricultural_inputs' | 'livestock';

export interface SectorExplorerFilters {
  countryIds: number[];
  startYear: number;
  endYear: number;
  sector: SectorKey;
  variables: string[];
}