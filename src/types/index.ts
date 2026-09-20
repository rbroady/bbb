export type CompanyStatus =
  | 'new'
  | 'saved'
  | 'passed'
  | 'contacted'
  | 'evaluating'
  | 'loi'
  | 'diligence'
  | 'closed';

export const PIPELINE_STATUSES: CompanyStatus[] = ['saved', 'contacted', 'evaluating', 'loi', 'diligence', 'closed'];

export type DataConfidence = 'Verified' | 'Reported' | 'Estimated' | 'Inferred' | 'Unknown';

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  state: string;
  yearsOperating: number;
  revenue: number;
  ebitda: number;
  sde: number;
  grossMargin: number;
  employees: number;
  googleRating: number;
  reviewCount: number;
  ownerName: string;
  ownerTenure: number;
  founderOwned: boolean;
  boringBizScore: number;
  businessQualityScore: number;
  sophisticationScore: number;
  acquisitionFitScore: number;
  untappedUpsideScore: number;
  status: CompanyStatus;
  websiteQuality: 1 | 2 | 3 | 4 | 5;
  hasOnlineBooking: boolean;
  hasCRM: boolean;
  hasActiveSEO: boolean;
  hasSocialMedia: boolean;
  hasPaidAds: boolean;
  askingPrice: number | null;
  valuationEstimate: number;
  sellerSignals: string[];
  signals: string[];
  editorialSummary: string;
  commonPraise: string[];
  commonComplaints: string[];
  competitionLevel: 'Low' | 'Medium' | 'High';
  localCompetitors: number;
  recurringRevenue: number;
  customerConcentration: number;
  marketingOpportunities: string[];
  aiOpportunities: string[];
  acquisitionRisks: Array<{ label: string; severity: 'Low' | 'Medium' | 'High' }>;
  nextSteps: string[];
  lastResearched: string;
  capex: number;
  workingCapital: number;
  dataConfidence?: DataConfidence;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused' | 'Running';
  lastRun: string;
  nextRun: string;
  businessesFound: number;
  newPrime: number;
  recentFinding: string;
  activityText: string[];
}

export interface BuyBox {
  minPrice: number;
  maxPrice: number;
  minRevenue: number;
  maxRevenue: number;
  minEbitda: number;
  maxEbitda: number;
  targetMultiple: number;
  minMargin: number;
  minFCF: number;
  maxCustomerConcentration: number;
  minRecurringRevenue: number;
  targetIndustries: string[];
  maybeIndustries: string[];
  avoidIndustries: string[];
  targetStates: string[];
  targetMetros: string[];
  preferRemoteManageable: boolean;
  sellerSituations: string[];
  equityPercent: number;
  sbaPercent: number;
  sellerNotePercent: number;
  earnoutPercent: number;
  notes: string;
}

export interface DealInputs {
  purchasePrice: number;
  revenue: number;
  ebitda: number;
  sde: number;
  ownerSalary: number;
  addBacks: number;
  growthRate: number;
  grossMargin: number;
  ebitdaMargin: number;
  capex: number;
  workingCapital: number;
  employees: number;
  customerConcentration: number;
  recurringRevenue: number;
  buyerEquity: number;
  sbaLoan: number;
  interestRate: number;
  loanTerm: number;
  sellerNote: number;
  sellerNoteRate: number;
  sellerNoteTerm: number;
  earnout: number;
}

export interface DealResults {
  ebitdaMultiple: number;
  sdeMultiple: number;
  revenueMultiple: number;
  annualDebtService: number;
  dscr: number;
  yearOneCashFlow: number;
  cashOnCash: number;
  buyerEquity: number;
  fiveYearProjection: YearProjection[];
  totalReturn5yr: number;
  irr: number;
  equityAtExit: number;
}

export interface YearProjection {
  year: number;
  revenue: number;
  ebitda: number;
  debtService: number;
  cashFlow: number;
  equity: number;
}

export interface ValueInitiative {
  id: string;
  label: string;
  cost: number;
  revenueImpact: number;
  ebitdaImpact: number;
  enabled: boolean;
  category: string;
}

export interface ScoreBreakdown {
  total: number;
  businessQuality: number;
  acquisitionFit: number;
  untappedUpside: number;
  breakdown: Record<string, { score: number; max: number; label: string }>;
}
