import { useMemo } from 'react';
import { companies as seedCompanies } from '@/data/companies';
import { useAppStore } from '@/store/useAppStore';
import { Company } from '@/types';

export function useAllCompanies(): Company[] {
  const manualCompanies = useAppStore(s => s.manualCompanies);
  return useMemo(() => [...manualCompanies, ...seedCompanies], [manualCompanies]);
}
