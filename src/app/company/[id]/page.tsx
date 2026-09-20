'use client';
import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanyById } from '@/data/companies';
import { useAppStore } from '@/store/useAppStore';
import { useAllCompanies } from '@/lib/useAllCompanies';
import { StatusChip } from '@/components/ui/StatusChip';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { formatCurrency, formatPercent, websiteQualityLabel } from '@/lib/formatting';
import { calculateBoringBizScore, getScoreColor } from '@/lib/scoring';
import { calculateDealMetrics, defaultDealInputs } from '@/lib/calculations';
import { Company, CompanyStatus, DealInputs, PIPELINE_STATUSES } from '@/types';
import {
  ArrowLeft, Globe, Star, Users, Calendar, TrendingUp, AlertTriangle,
  Zap, Target, CheckSquare, Bookmark, X, ChevronDown, ChevronRight,
  FileText, BarChart2, StickyNote
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

type Tab = 'overview' | 'research' | 'deal' | 'notes';

function DataRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-[12px] text-text-secondary">{label}</span>
      <div className="text-right">
        <span className="text-[12px] font-medium text-text-primary tabular-nums">{value}</span>
        {sub && <p className="text-[11px] text-text-tertiary">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3 pt-5 pb-2 border-t border-border-subtle mt-5 first:mt-0 first:border-t-0">
      {title}
    </h2>
  );
}

function DealInput({ label, value, onChange, prefix = '', suffix = '', type = 'number' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-text-secondary mb-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-2.5 text-[12px] text-text-tertiary">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full h-8 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary tabular-nums ${prefix ? 'pl-5' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-2.5 text-[12px] text-text-tertiary">{suffix}</span>}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, good, neutral }: {
  label: string; value: string; sub?: string; good?: boolean; neutral?: boolean;
}) {
  const bg = good ? 'bg-positive-soft' : neutral ? 'bg-bg-surface' : 'bg-warning-soft';
  const textColor = good ? 'text-positive' : neutral ? 'text-text-primary' : 'text-warning';
  return (
    <div className={`${bg} rounded-lg p-3`}>
      <p className="text-[10px] text-text-tertiary mb-1">{label}</p>
      <p className={`text-[16px] font-bold tabular-nums ${textColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CompanyPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');

  const { companyStatuses, setCompanyStatus, companyNotes, setCompanyNotes, companyDealInputs, setCompanyDealInputs, dealInputs: globalDefaults } = useAppStore();
  const allCompanies = useAllCompanies();

  const seedCompany = getCompanyById(id);
  const company: Company | undefined = allCompanies.find(c => c.id === id) ?? seedCompany;

  if (!company) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="font-serif text-[22px] text-text-secondary">Company not found.</p>
        <button onClick={() => router.back()} className="text-[13px] text-accent mt-3 hover:underline">Go back</button>
      </div>
    );
  }

  const currentStatus: CompanyStatus = (companyStatuses[company.id] as CompanyStatus) ?? company.status;
  const notes = companyNotes[company.id] ?? '';
  const score = calculateBoringBizScore(company);
  const ebitdaMargin = (company.ebitda / company.revenue) * 100;

  const companyOverrides = companyDealInputs[company.id] ?? {};
  const dealInputs: DealInputs = {
    ...globalDefaults,
    purchasePrice: company.askingPrice ?? company.valuationEstimate,
    revenue: company.revenue,
    ebitda: company.ebitda,
    sde: company.sde,
    grossMargin: company.grossMargin,
    capex: company.capex,
    workingCapital: company.workingCapital,
    customerConcentration: company.customerConcentration,
    recurringRevenue: company.recurringRevenue,
    employees: company.employees,
    ...companyOverrides,
  };

  const deal = useMemo(() => calculateDealMetrics(dealInputs), [dealInputs.purchasePrice, dealInputs.revenue, dealInputs.ebitda, dealInputs.sde, dealInputs.buyerEquity, dealInputs.sbaLoan, dealInputs.interestRate, dealInputs.loanTerm, dealInputs.sellerNote, dealInputs.growthRate]);

  const inPipeline = PIPELINE_STATUSES.includes(currentStatus);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Target size={13} /> },
    { key: 'research', label: 'Research', icon: <FileText size={13} /> },
    { key: 'deal', label: 'Deal', icon: <BarChart2 size={13} /> },
    { key: 'notes', label: 'Notes', icon: <StickyNote size={13} /> },
  ];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-[920px]">
        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary mb-5 transition-colors"
        >
          <ArrowLeft size={13} />
          Discover
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-[22px] md:text-[26px] font-semibold text-text-primary leading-tight">{company.name}</h1>
              <StatusChip status={currentStatus} />
            </div>
            <p className="text-[13px] text-text-secondary">
              {company.industry} · {company.city}, {company.state} · {company.yearsOperating} yrs
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentStatus === 'new' && (
              <>
                <button
                  onClick={() => setCompanyStatus(company.id, 'saved')}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-accent text-text-inverse font-medium hover:bg-accent-hover transition-colors"
                >
                  <Bookmark size={13} />
                  Save
                </button>
                <button
                  onClick={() => { setCompanyStatus(company.id, 'passed'); router.push('/'); }}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-border-default text-text-secondary font-medium hover:bg-bg-hover transition-colors"
                >
                  <X size={13} />
                  Pass
                </button>
              </>
            )}
            {currentStatus === 'saved' && !inPipeline && (
              <button
                onClick={() => setCompanyStatus(company.id, 'contacted')}
                className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-accent text-text-inverse font-medium hover:bg-accent-hover transition-colors"
              >
                Move to Pipeline
                <ChevronRight size={13} />
              </button>
            )}
            {inPipeline && (
              <select
                value={currentStatus}
                onChange={e => setCompanyStatus(company.id, e.target.value as CompanyStatus)}
                className="text-[12px] px-3 py-1.5 rounded-lg border border-border-default bg-bg-surface text-text-primary font-medium cursor-pointer"
              >
                {PIPELINE_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Score row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Business Quality', value: score.businessQuality, max: 40, color: 'accent' as const },
            { label: 'Acquisition Fit', value: score.acquisitionFit, max: 25, color: 'positive' as const },
            { label: 'Untapped Upside', value: score.untappedUpside, max: 35, color: 'warning' as const },
          ].map(s => (
            <div key={s.label} className="bg-bg-surface border border-border-subtle rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-text-secondary hidden sm:block">{s.label}</p>
                <p className="text-[11px] text-text-secondary sm:hidden">{s.label.split(' ')[0]}</p>
                <p className={`text-[14px] font-bold tabular-nums ${getScoreColor(s.value / s.max * 100)}`}>
                  {s.value}<span className="text-text-tertiary text-[10px]">/{s.max}</span>
                </p>
              </div>
              <ScoreBar value={s.value} max={s.max} color={s.color} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-border-subtle mb-5 -mx-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div>
            {/* Editorial */}
            <div className="bg-accent-softer border border-accent/20 rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[11px] font-semibold text-accent-ink uppercase tracking-wider mb-2">Why this business</p>
              <p className="text-[14px] text-text-primary leading-relaxed">{company.editorialSummary}</p>
            </div>

            {/* Signal tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {company.signals.map(s => (
                <span key={s} className="text-[12px] px-3 py-1 bg-bg-subtle border border-border-subtle rounded-full text-text-secondary font-medium">
                  {s}
                </span>
              ))}
            </div>

            {/* Key financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <MetricCard label="Revenue" value={formatCurrency(company.revenue, true)} neutral />
              <MetricCard label="EBITDA" value={formatCurrency(company.ebitda, true)} sub={`${ebitdaMargin.toFixed(0)}% margin`} good={ebitdaMargin >= 20} neutral={ebitdaMargin < 20} />
              <MetricCard label="Est. Value" value={formatCurrency(company.valuationEstimate, true)} neutral />
              <MetricCard label="Years Operating" value={`${company.yearsOperating}y`} good={company.yearsOperating >= 15} neutral={company.yearsOperating < 15} />
            </div>

            {/* Seller signals */}
            {company.sellerSignals.length > 0 && (
              <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-5">
                <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">Seller Signals</h3>
                <div className="space-y-1.5">
                  {company.sellerSignals.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0" />
                      <span className="text-[13px] text-text-primary">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
              <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
                <CheckSquare size={13} className="inline mr-1.5" />Next Steps
              </h3>
              <ul className="space-y-2">
                {company.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                    <span className="w-4 h-4 rounded-full border-2 border-border-default flex-shrink-0 mt-0.5" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── RESEARCH TAB ── */}
        {tab === 'research' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {/* Fundamentals */}
              <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
                <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  <TrendingUp size={13} className="inline mr-1.5" />Business Fundamentals
                </h3>
                <DataRow label="Revenue" value={formatCurrency(company.revenue)} />
                <DataRow label="EBITDA" value={formatCurrency(company.ebitda)} sub={`${ebitdaMargin.toFixed(0)}% margin`} />
                <DataRow label="SDE" value={formatCurrency(company.sde)} />
                <DataRow label="Gross Margin" value={`${company.grossMargin}%`} />
                <DataRow label="Employees" value={company.employees} />
                <DataRow label="Recurring Revenue" value={`${company.recurringRevenue}%`} />
                <DataRow label="Customer Concentration" value={`${company.customerConcentration}%`} />
              </div>
              {/* Ownership */}
              <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
                <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  <Users size={13} className="inline mr-1.5" />Ownership
                </h3>
                <DataRow label="Owner" value={company.ownerName} />
                <DataRow label="Tenure" value={`${company.ownerTenure} years`} />
                <DataRow label="Founder?" value={company.founderOwned ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Reputation */}
            <SectionHeader title="Reputation" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-[32px] font-bold tabular-nums text-text-primary">{company.googleRating}</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(company.googleRating) ? 'text-warning fill-warning' : 'text-border-default'} />
                    ))}
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-1">{company.reviewCount} reviews</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 flex-1">
                  <div>
                    <p className="text-[11px] font-medium text-positive mb-1">Praise</p>
                    {company.commonPraise.map(p => <p key={p} className="text-[12px] text-text-secondary">· {p}</p>)}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-warning mb-1">Complaints</p>
                    {company.commonComplaints.map(p => <p key={p} className="text-[12px] text-text-secondary">· {p}</p>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Presence */}
            <SectionHeader title="Digital Presence" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { label: 'Website', value: websiteQualityLabel(company.websiteQuality), good: company.websiteQuality >= 4, icon: Globe },
                  { label: 'Booking', value: company.hasOnlineBooking ? 'Yes' : 'No', good: company.hasOnlineBooking, icon: Calendar },
                  { label: 'CRM', value: company.hasCRM ? 'Active' : 'None', good: company.hasCRM, icon: Users },
                  { label: 'SEO', value: company.hasActiveSEO ? 'Active' : 'None', good: company.hasActiveSEO, icon: TrendingUp },
                  { label: 'Paid Ads', value: company.hasPaidAds ? 'Running' : 'None', good: company.hasPaidAds, icon: Target },
                ].map(({ label, value, good, icon: Icon }) => (
                  <div key={label} className={`p-3 rounded-lg text-center ${good ? 'bg-positive-soft' : 'bg-bg-subtle'}`}>
                    <Icon size={16} className={`mx-auto mb-1 ${good ? 'text-positive' : 'text-text-tertiary'}`} />
                    <p className="text-[10px] text-text-tertiary mb-0.5">{label}</p>
                    <p className={`text-[12px] font-medium ${good ? 'text-positive' : 'text-text-secondary'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <SectionHeader title="Acquisition Risks" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
              <div className="space-y-2">
                {company.acquisitionRisks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle size={13} className={`mt-0.5 flex-shrink-0 ${
                      risk.severity === 'High' ? 'text-negative' :
                      risk.severity === 'Medium' ? 'text-warning' :
                      'text-text-tertiary'
                    }`} />
                    <span className="text-[13px] text-text-primary flex-1">{risk.label}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      risk.severity === 'High' ? 'bg-negative-soft text-negative' :
                      risk.severity === 'Medium' ? 'bg-warning-soft text-warning' :
                      'bg-bg-subtle text-text-tertiary'
                    }`}>{risk.severity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <SectionHeader title="Improvement Opportunities" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-text-secondary mb-2">Marketing</p>
                <ul className="space-y-1.5">
                  {company.marketingOpportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-text-primary">
                      <TrendingUp size={12} className="text-info mt-0.5 flex-shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-secondary mb-2">AI + Automation</p>
                <ul className="space-y-1.5">
                  {company.aiOpportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-text-primary">
                      <Zap size={12} className="text-warning mt-0.5 flex-shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Valuation */}
            <SectionHeader title="Valuation" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
                <DataRow label="EBITDA Multiple" value={`${(company.valuationEstimate / company.ebitda).toFixed(1)}x`} />
                <DataRow label="SDE Multiple" value={`${(company.valuationEstimate / company.sde).toFixed(1)}x`} />
                <DataRow label="Revenue Multiple" value={`${(company.valuationEstimate / company.revenue).toFixed(2)}x`} />
                <DataRow label="Estimate" value={formatCurrency(company.valuationEstimate)} />
                {company.askingPrice && <DataRow label="Asking Price" value={formatCurrency(company.askingPrice)} />}
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
                <p className="text-[11px] font-semibold text-text-secondary mb-2">Financing Snapshot</p>
                <DataRow label="Equity (20%)" value={formatCurrency(company.valuationEstimate * 0.2, true)} />
                <DataRow label="SBA Loan (70%)" value={formatCurrency(company.valuationEstimate * 0.7, true)} />
                <DataRow label="Seller Note (10%)" value={formatCurrency(company.valuationEstimate * 0.1, true)} />
              </div>
            </div>
          </div>
        )}

        {/* ── DEAL TAB ── */}
        {tab === 'deal' && (
          <div>
            <div className="flex flex-col lg:flex-row gap-5">
              {/* Inputs */}
              <div className="w-full lg:w-[280px] flex-shrink-0">
                <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 space-y-3">
                  <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Deal Inputs</p>
                  <DealInput label="Purchase Price" value={dealInputs.purchasePrice} prefix="$"
                    onChange={v => setCompanyDealInputs(company.id, { purchasePrice: v })} />
                  <DealInput label="Revenue" value={dealInputs.revenue} prefix="$"
                    onChange={v => setCompanyDealInputs(company.id, { revenue: v })} />
                  <DealInput label="EBITDA" value={dealInputs.ebitda} prefix="$"
                    onChange={v => setCompanyDealInputs(company.id, { ebitda: v })} />
                  <DealInput label="SDE" value={dealInputs.sde} prefix="$"
                    onChange={v => setCompanyDealInputs(company.id, { sde: v })} />
                  <div className="pt-2 border-t border-border-subtle">
                    <p className="text-[11px] font-semibold text-text-secondary mb-2">Financing</p>
                    <div className="space-y-2">
                      <DealInput label="Buyer Equity" value={dealInputs.buyerEquity} prefix="$"
                        onChange={v => setCompanyDealInputs(company.id, { buyerEquity: v })} />
                      <DealInput label="SBA Loan" value={dealInputs.sbaLoan} prefix="$"
                        onChange={v => setCompanyDealInputs(company.id, { sbaLoan: v })} />
                      <DealInput label="Interest Rate" value={dealInputs.interestRate} suffix="%"
                        onChange={v => setCompanyDealInputs(company.id, { interestRate: v })} />
                      <DealInput label="Loan Term" value={dealInputs.loanTerm} suffix="yrs"
                        onChange={v => setCompanyDealInputs(company.id, { loanTerm: v })} />
                      <DealInput label="Seller Note" value={dealInputs.sellerNote} prefix="$"
                        onChange={v => setCompanyDealInputs(company.id, { sellerNote: v })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="DSCR" value={deal.dscr.toFixed(2)} sub="target >1.25x"
                    good={deal.dscr >= 1.25} neutral={deal.dscr < 1.25} />
                  <MetricCard label="Cash-on-Cash" value={formatPercent(deal.cashOnCash)}
                    good={deal.cashOnCash >= 15} neutral={deal.cashOnCash < 15} />
                  <MetricCard label="Year 1 Cash Flow" value={formatCurrency(deal.yearOneCashFlow, true)}
                    good={deal.yearOneCashFlow > 0} neutral={deal.yearOneCashFlow <= 0} />
                  <MetricCard label="EBITDA Multiple" value={`${deal.ebitdaMultiple.toFixed(1)}x`}
                    good={deal.ebitdaMultiple <= 4} neutral={deal.ebitdaMultiple > 4} />
                  <MetricCard label="Debt Service / yr" value={formatCurrency(deal.annualDebtService, true)} neutral />
                  <MetricCard label="IRR (5yr)" value={formatPercent(deal.irr)}
                    good={deal.irr >= 20} neutral={deal.irr < 20} />
                </div>

                {/* 5-year projection */}
                <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-bg-subtle border-b border-border-subtle">
                      <tr>
                        {['Year', 'Revenue', 'EBITDA', 'Debt Service', 'Cash Flow', 'Equity'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[11px] font-semibold text-text-secondary">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deal.fiveYearProjection.map(yr => (
                        <tr key={yr.year} className="border-b border-border-subtle last:border-0 hover:bg-bg-hover">
                          <td className="px-3 py-2 text-[12px] font-medium text-text-secondary">Y{yr.year}</td>
                          <td className="px-3 py-2 text-[12px] tabular-nums">{formatCurrency(yr.revenue, true)}</td>
                          <td className="px-3 py-2 text-[12px] tabular-nums">{formatCurrency(yr.ebitda, true)}</td>
                          <td className="px-3 py-2 text-[12px] tabular-nums text-text-secondary">{formatCurrency(yr.debtService, true)}</td>
                          <td className={`px-3 py-2 text-[12px] tabular-nums font-medium ${yr.cashFlow > 0 ? 'text-positive' : 'text-negative'}`}>
                            {formatCurrency(yr.cashFlow, true)}
                          </td>
                          <td className="px-3 py-2 text-[12px] tabular-nums">{formatCurrency(yr.equity, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-text-tertiary">
                  Assumes {dealInputs.growthRate}% annual revenue growth and {dealInputs.interestRate}% loan rate.
                  Equity at exit: {formatCurrency(deal.equityAtExit, true)} · 5yr return: {formatPercent(deal.totalReturn5yr)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES TAB ── */}
        {tab === 'notes' && (
          <div>
            <textarea
              value={notes}
              onChange={e => setCompanyNotes(company.id, e.target.value)}
              placeholder="Your notes about this company..."
              className="w-full h-64 text-[13px] bg-bg-surface border border-border-subtle rounded-[10px] p-4 focus:outline-none focus:border-accent text-text-primary leading-relaxed resize-y"
            />
            <p className="text-[11px] text-text-tertiary mt-2">Notes are saved automatically to your browser.</p>
          </div>
        )}
      </div>
    </div>
  );
}
