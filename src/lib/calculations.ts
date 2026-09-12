import { DealInputs, DealResults, YearProjection } from '@/types';

function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateDealMetrics(inputs: DealInputs): DealResults {
  const {
    purchasePrice,
    revenue,
    ebitda,
    sde,
    ownerSalary,
    growthRate,
    buyerEquity,
    sbaLoan,
    interestRate,
    loanTerm,
    sellerNote,
    sellerNoteRate,
    sellerNoteTerm,
  } = inputs;

  // Multiples
  const ebitdaMultiple = ebitda > 0 ? purchasePrice / ebitda : 0;
  const sdeMultiple = sde > 0 ? purchasePrice / sde : 0;
  const revenueMultiple = revenue > 0 ? purchasePrice / revenue : 0;

  // Debt service
  const sbaMonthly = monthlyPayment(sbaLoan, interestRate, loanTerm);
  const sellerNoteMonthly = monthlyPayment(sellerNote, sellerNoteRate, sellerNoteTerm);
  const annualDebtService = (sbaMonthly + sellerNoteMonthly) * 12;

  // Cash flow
  const adjustedSDE = sde - ownerSalary;
  const yearOneCashFlow = adjustedSDE - annualDebtService;
  const cashOnCash = buyerEquity > 0 ? yearOneCashFlow / buyerEquity : 0;

  // DSCR
  const dscr = annualDebtService > 0 ? adjustedSDE / annualDebtService : 0;

  // 5-year projection
  const fiveYearProjection: YearProjection[] = [];
  let currentRevenue = revenue;
  let currentEbitda = ebitda;
  let remainingSbaBalance = sbaLoan;
  let remainingSellerBalance = sellerNote;

  for (let year = 1; year <= 5; year++) {
    currentRevenue *= (1 + growthRate / 100);
    currentEbitda *= (1 + growthRate / 100);

    // Rough equity build: balance paid down
    const sbaPrincipalAnnual = sbaMonthly * 12 - (remainingSbaBalance * (interestRate / 100));
    remainingSbaBalance = Math.max(0, remainingSbaBalance - sbaPrincipalAnnual);
    const sellerNotePrincipalAnnual = sellerNoteMonthly * 12 - (remainingSellerBalance * (sellerNoteRate / 100));
    remainingSellerBalance = Math.max(0, remainingSellerBalance - sellerNotePrincipalAnnual);

    const totalDebt = remainingSbaBalance + remainingSellerBalance;
    const equityValue = purchasePrice * Math.pow(1 + (growthRate / 100) * 0.5, year) - totalDebt;

    fiveYearProjection.push({
      year,
      revenue: currentRevenue,
      ebitda: currentEbitda,
      debtService: annualDebtService,
      cashFlow: currentEbitda - ownerSalary - annualDebtService,
      equity: equityValue,
    });
  }

  const totalReturn5yr = fiveYearProjection.reduce((sum, y) => sum + y.cashFlow, 0);
  const equityAtExit = fiveYearProjection[4]?.equity ?? 0;

  // IRR approximation
  const totalCashIn = buyerEquity;
  const totalCashOut = totalReturn5yr + equityAtExit;
  const irr = totalCashIn > 0 ? Math.pow(totalCashOut / totalCashIn, 1 / 5) - 1 : 0;

  return {
    ebitdaMultiple,
    sdeMultiple,
    revenueMultiple,
    annualDebtService,
    dscr,
    yearOneCashFlow,
    cashOnCash,
    buyerEquity,
    fiveYearProjection,
    totalReturn5yr,
    irr,
    equityAtExit,
  };
}

export const defaultDealInputs: DealInputs = {
  purchasePrice: 1750000,
  revenue: 2100000,
  ebitda: 378000,
  sde: 450000,
  ownerSalary: 120000,
  addBacks: 45000,
  growthRate: 5,
  grossMargin: 52,
  ebitdaMargin: 18,
  capex: 60000,
  workingCapital: 105000,
  employees: 16,
  customerConcentration: 6,
  recurringRevenue: 68,
  buyerEquity: 350000,
  sbaLoan: 1225000,
  interestRate: 6.5,
  loanTerm: 10,
  sellerNote: 175000,
  sellerNoteRate: 6.0,
  sellerNoteTerm: 5,
  earnout: 0,
};
