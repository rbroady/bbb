'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BuyBox, Company, DealInputs, ValueInitiative } from '@/types';
import { defaultDealInputs } from '@/lib/calculations';
import { defaultInitiatives } from '@/data/improvements';

const defaultBuyBox: BuyBox = {
  minPrice: 500000,
  maxPrice: 3000000,
  minRevenue: 1000000,
  maxRevenue: 6000000,
  minEbitda: 200000,
  maxEbitda: 900000,
  targetMultiple: 4.0,
  minMargin: 15,
  minFCF: 150000,
  maxCustomerConcentration: 25,
  minRecurringRevenue: 20,
  targetIndustries: ['HVAC', 'Plumbing', 'Pest Control', 'Septic Service', 'Locksmith', 'Pool Service', 'Irrigation'],
  maybeIndustries: ['Roofing', 'Electrical', 'Commercial Cleaning', 'Restoration', 'Equipment Services', 'Tree Service'],
  avoidIndustries: ['Moving', 'Handyman'],
  targetStates: ['OR', 'WA', 'ID'],
  targetMetros: ['Portland', 'Salem', 'Eugene', 'Seattle', 'Spokane', 'Tacoma', 'Boise'],
  preferRemoteManageable: false,
  sellerSituations: ['Retirement', 'Health', 'Relocation', 'Burnout', 'No successor'],
  equityPercent: 20,
  sbaPercent: 70,
  sellerNotePercent: 10,
  earnoutPercent: 0,
  notes: '',
};

interface AppStore {
  buyBox: BuyBox;
  setBuyBox: (buyBox: Partial<BuyBox>) => void;
  resetBuyBox: () => void;

  dealInputs: DealInputs;
  setDealInputs: (inputs: Partial<DealInputs>) => void;
  resetDealInputs: () => void;

  initiatives: ValueInitiative[];
  setInitiatives: (initiatives: ValueInitiative[]) => void;
  toggleInitiative: (id: string) => void;

  pipelineOverrides: Record<string, string>;
  setPipelineStage: (companyId: string, stage: string) => void;

  watchlist: string[];
  toggleWatchlist: (companyId: string) => void;

  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      buyBox: defaultBuyBox,
      setBuyBox: (partial) => set((state) => ({ buyBox: { ...state.buyBox, ...partial } })),
      resetBuyBox: () => set({ buyBox: defaultBuyBox }),

      dealInputs: defaultDealInputs,
      setDealInputs: (partial) => set((state) => ({ dealInputs: { ...state.dealInputs, ...partial } })),
      resetDealInputs: () => set({ dealInputs: defaultDealInputs }),

      initiatives: defaultInitiatives,
      setInitiatives: (initiatives) => set({ initiatives }),
      toggleInitiative: (id) => set((state) => ({
        initiatives: state.initiatives.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i),
      })),

      pipelineOverrides: {},
      setPipelineStage: (companyId, stage) => set((state) => ({
        pipelineOverrides: { ...state.pipelineOverrides, [companyId]: stage },
      })),

      watchlist: [],
      toggleWatchlist: (companyId) => set((state) => ({
        watchlist: state.watchlist.includes(companyId)
          ? state.watchlist.filter(id => id !== companyId)
          : [...state.watchlist, companyId],
      })),

      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
    }),
    { name: 'boring-biz-hunt' }
  )
);
