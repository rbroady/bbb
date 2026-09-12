'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanyById } from '@/data/companies';
import { StatusChip } from '@/components/ui/StatusChip';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { Button } from '@/components/ui/Button';
import { InvestmentMemo } from '@/components/features/InvestmentMemo';
import { formatCurrency, websiteQualityLabel } from '@/lib/formatting';
import { ArrowLeft, Globe, Star, Users, Calendar, TrendingUp, AlertTriangle, Zap, Target, CheckSquare } from 'lucide-react';
import { calculateBoringBizScore } from '@/lib/scoring';

interface Props {
  params: Promise<{ id: string }>;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3 pt-5 pb-2 border-t border-border-subtle mt-5 first:mt-0 first:border-t-0">
      {title}
    </h2>
  );
}

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

export default function CompanyPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [showMemo, setShowMemo] = useState(false);
  const company = getCompanyById(id);

  if (!company) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="font-serif text-[22px] text-text-secondary">Company not found.</p>
        <button onClick={() => router.back()} className="text-[13px] text-accent mt-3 hover:underline">Go back</button>
      </div>
    );
  }

  if (showMemo) {
    return <InvestmentMemo company={company} onClose={() => setShowMemo(false)} />;
  }

  const score = calculateBoringBizScore(company);
  const ebitdaMargin = (company.ebitda / company.revenue) * 100;
  const sdeMargin = (company.sde / company.revenue) * 100;

  return (
    <div className="px-8 py-8">
      <div className="max-w-[920px]">
        {/* Back */}
        <button
          onClick={() => router.push('/targets')}
          className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary mb-5 transition-colors"
        >
          <ArrowLeft size={13} />
          Targets
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[28px] font-semibold text-text-primary leading-tight">{company.name}</h1>
              <StatusChip status={company.status} />
            </div>
            <p className="text-[14px] text-text-secondary">
              {company.industry} · {company.city}, {company.state} · {company.yearsOperating} years
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-6">
            <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-0.5">Boring Biz Score</p>
            <p className="text-[52px] font-bold tabular-nums text-text-primary leading-none">{company.boringBizScore}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[11px] text-text-secondary">
                Quality {score.businessQuality}/40 · Fit {score.acquisitionFit}/25 · Upside {score.untappedUpside}/35
              </span>
            </div>
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
          {[
            { label: 'Business Quality', value: score.businessQuality, max: 40, color: 'accent' as const },
            { label: 'Acquisition Fit', value: score.acquisitionFit, max: 25, color: 'positive' as const },
            { label: 'Untapped Upside', value: score.untappedUpside, max: 35, color: 'warning' as const },
          ].map(s => (
            <div key={s.label} className="bg-bg-surface border border-border-subtle rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-text-secondary">{s.label}</p>
                <p className="text-[13px] font-semibold tabular-nums text-text-primary">{s.value}<span className="text-text-tertiary text-[10px]">/{s.max}</span></p>
              </div>
              <ScoreBar value={s.value} max={s.max} color={s.color} />
            </div>
          ))}
        </div>

        {/* Editorial */}
        <div className="bg-accent-softer border border-accent/20 rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[11px] font-semibold text-accent-ink uppercase tracking-wider mb-2">Why this business is interesting</p>
          <p className="text-[14px] text-text-primary leading-relaxed">{company.editorialSummary}</p>
        </div>

        {/* Key signals */}
        <div className="flex flex-wrap gap-2 mb-6">
          {company.signals.map(s => (
            <span key={s} className="text-[12px] px-3 py-1 bg-bg-subtle border border-border-subtle rounded-full text-text-secondary font-medium">
              {s}
            </span>
          ))}
        </div>

        {/* Two-column fundamentals */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          {/* Business fundamentals */}
          <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
            <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              <TrendingUp size={13} className="inline mr-1.5" />Business Fundamentals
            </h3>
            <DataRow label="Revenue" value={formatCurrency(company.revenue)} />
            <DataRow label="EBITDA" value={formatCurrency(company.ebitda)} sub={`${ebitdaMargin.toFixed(0)}% margin`} />
            <DataRow label="SDE" value={formatCurrency(company.sde)} sub={`${sdeMargin.toFixed(0)}% margin`} />
            <DataRow label="Gross Margin" value={`${company.grossMargin}%`} />
            <DataRow label="Employees" value={company.employees} />
            <DataRow label="Years Operating" value={`${company.yearsOperating} years`} />
            <DataRow label="Recurring Revenue" value={`${company.recurringRevenue}%`} />
            <DataRow label="Customer Concentration" value={`${company.customerConcentration}%`} />
            <DataRow label="Est. Valuation" value={formatCurrency(company.valuationEstimate)} />
            {company.askingPrice && <DataRow label="Asking Price" value={formatCurrency(company.askingPrice)} />}
          </div>

          {/* Ownership */}
          <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
            <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              <Users size={13} className="inline mr-1.5" />Ownership
            </h3>
            <DataRow label="Owner" value={company.ownerName} />
            <DataRow label="Tenure" value={`${company.ownerTenure} years`} />
            <DataRow label="Founder?" value={company.founderOwned ? 'Yes' : 'No'} />
            <DataRow label="Employees" value={company.employees} />

            <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mt-4 mb-2">Seller Signals</h3>
            <div className="space-y-1.5">
              {company.sellerSignals.map(s => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0" />
                  <span className="text-[12px] text-text-secondary">{s}</span>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-2 gap-x-8 flex-1">
              <div>
                <p className="text-[11px] font-medium text-positive mb-1">Common praise</p>
                {company.commonPraise.map(p => (
                  <p key={p} className="text-[12px] text-text-secondary">· {p}</p>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-medium text-warning mb-1">Common complaints</p>
                {company.commonComplaints.map(p => (
                  <p key={p} className="text-[12px] text-text-secondary">· {p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <SectionHeader title="Digital Presence" />
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Website', value: websiteQualityLabel(company.websiteQuality), good: company.websiteQuality >= 4, icon: Globe },
              { label: 'Online Booking', value: company.hasOnlineBooking ? 'Yes' : 'No', good: company.hasOnlineBooking, icon: Calendar },
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

        {/* Competition & Seller Signals */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionHeader title="Competition" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
              <DataRow label="Competition Level" value={company.competitionLevel} />
              <DataRow label="Local Competitors" value={company.localCompetitors} />
            </div>
          </div>
          <div>
            <SectionHeader title="Deal Details" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
              <DataRow label="Status" value={<StatusChip status={company.status} size="sm" />} />
              <DataRow label="Est. Valuation" value={formatCurrency(company.valuationEstimate, true)} />
              {company.askingPrice && <DataRow label="Asking Price" value={formatCurrency(company.askingPrice, true)} />}
            </div>
          </div>
        </div>

        {/* Marketing Opportunity */}
        <SectionHeader title="Marketing Opportunity" />
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
          <ul className="space-y-2">
            {company.marketingOpportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                <TrendingUp size={13} className="text-info mt-0.5 flex-shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Opportunity */}
        <SectionHeader title="AI + Automation Opportunity" />
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-2">
          <ul className="space-y-2">
            {company.aiOpportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                <Zap size={13} className="text-warning mt-0.5 flex-shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* Acquisition Risks */}
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

        {/* Valuation & Financing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SectionHeader title="Estimated Valuation" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
              <DataRow label="EBITDA Multiple" value={`${(company.valuationEstimate / company.ebitda).toFixed(1)}x`} />
              <DataRow label="SDE Multiple" value={`${(company.valuationEstimate / company.sde).toFixed(1)}x`} />
              <DataRow label="Revenue Multiple" value={`${(company.valuationEstimate / company.revenue).toFixed(1)}x`} />
              <DataRow label="Estimate" value={formatCurrency(company.valuationEstimate)} />
            </div>
          </div>
          <div>
            <SectionHeader title="Financing Snapshot" />
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4">
              <DataRow label="20% Equity" value={formatCurrency(company.valuationEstimate * 0.2, true)} />
              <DataRow label="SBA Loan (70%)" value={formatCurrency(company.valuationEstimate * 0.7, true)} />
              <DataRow label="Seller Note (10%)" value={formatCurrency(company.valuationEstimate * 0.1, true)} />
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <SectionHeader title="Next Steps" />
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 mb-6">
          <ul className="space-y-2">
            {company.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                <CheckSquare size={13} className="text-accent mt-0.5 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-12">
          <Button variant="primary" size="lg" onClick={() => router.push('/deal-analyzer')}>
            Analyze Deal
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push('/pipeline')}>
            Add to Pipeline
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setShowMemo(true)}>
            Generate Memo
          </Button>
        </div>
      </div>
    </div>
  );
}
