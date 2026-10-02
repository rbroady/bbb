import { useMemo } from 'react';
import { companies as seedCompanies } from '@/data/companies';
import { companyCoords } from '@/data/companyCoords';
import { useAppStore } from '@/store/useAppStore';
import { Company } from '@/types';

const enrichedSeed: Company[] = seedCompanies.map(c => ({
  ...c,
  ...(companyCoords[c.id] ?? {}),
}));

export function useAllCompanies(): Company[] {
  const manualCompanies = useAppStore(s => s.manualCompanies);
  return useMemo(() => [...manualCompanies, ...enrichedSeed], [manualCompanies]);
}
