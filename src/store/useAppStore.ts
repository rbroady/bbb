'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BuyBox, Company, CompanyStatus, DealInputs, ValueInitiative } from '@/types';
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

  companyDealInputs: Record<string, Partial<DealInputs>>;
  setCompanyDealInputs: (companyId: string, inputs: Partial<DealInputs>) => void;

  initiatives: ValueInitiative[];
  setInitiatives: (initiatives: ValueInitiative[]) => void;
  toggleInitiative: (id: string) => void;

  companyStatuses: Record<string, CompanyStatus>;
  setCompanyStatus: (companyId: string, status: CompanyStatus) => void;

  companyNotes: Record<string, string>;
  setCompanyNotes: (companyId: string, notes: string) => void;

  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;

  manualCompanies: Company[];
  addManualCompany: (company: Company) => void;
  updateManualCompany: (id: string, updates: Partial<Company>) => void;
  removeManualCompany: (id: string) => void;
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

      companyDealInputs: {},
      setCompanyDealInputs: (companyId, inputs) => set((state) => ({
        companyDealInputs: {
          ...state.companyDealInputs,
          [companyId]: { ...(state.companyDealInputs[companyId] ?? {}), ...inputs },
        },
      })),

      initiatives: defaultInitiatives,
      setInitiatives: (initiatives) => set({ initiatives }),
      toggleInitiative: (id) => set((state) => ({
        initiatives: state.initiatives.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i),
      })),

      companyStatuses: {},
      setCompanyStatus: (companyId, status) => set((state) => ({
        companyStatuses: { ...state.companyStatuses, [companyId]: status },
      })),

      companyNotes: {},
      setCompanyNotes: (companyId, notes) => set((state) => ({
        companyNotes: { ...state.companyNotes, [companyId]: notes },
      })),

      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),

      manualCompanies: [],
      addManualCompany: (company) => set((state) => ({
        manualCompanies: [company, ...state.manualCompanies],
      })),
      updateManualCompany: (id, updates) => set((state) => ({
        manualCompanies: state.manualCompanies.map(c => c.id === id ? { ...c, ...updates } : c),
      })),
      removeManualCompany: (id) => set((state) => ({
        manualCompanies: state.manualCompanies.filter(c => c.id !== id),
      })),
    }),
    { name: 'boring-biz-hunt' }
  )
);
