'use client';
import { Company } from '@/types';
import { formatCurrency, formatMultiple } from '@/lib/formatting';

interface Props {
  company: Company;
  onClose?: () => void;
}

type Recommendation = 'PURSUE' | 'WATCH' | 'PASS';

function getRecommendation(company: Company): Recommendation {
  if (company.boringBizScore >= 80 && company.status !== 'passed') return 'PURSUE';
  if (company.boringBizScore >= 65) return 'WATCH';
  return 'PASS';
}

export function InvestmentMemo({ company, onClose }: Props) {
  const rec = getRecommendation(company);
  const recColor = rec === 'PURSUE' ? 'text-accent' : rec === 'WATCH' ? 'text-warning' : 'text-text-primary';
  const ebitdaMultiple = company.valuationEstimate / company.ebitda;
  const sdeMultiple = company.valuationEstimate / company.sde;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-bg-canvas min-h-screen">
      <div className="max-w-[820px] mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-border-default">
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-widest mb-2">Investment Memo</p>
            <h1 className="font-serif text-[32px] text-text-primary leading-tight">{company.name}</h1>
            <p className="text-[14px] text-text-secondary mt-2">{company.industry} · {company.city}, {company.state} · {company.yearsOperating} years</p>
            <p className="text-[12px] text-text-tertiary mt-1">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-text-tertiary uppercase tracking-wide mb-1">Boring Biz Score</p>
            <p className="text-[48px] font-bold tabular-nums text-text-primary leading-none">{company.boringBizScore}</p>
            <p className={`text-[22px] font-bold mt-2 ${recColor}`}>{rec}</p>
          </div>
        </div>

        {/* Thesis */}
        <Section title="Thesis">
          <p className="text-[14px] leading-relaxed text-text-primary">
            {company.editorialSummary} The combination of {company.yearsOperating} years of operations, a {company.googleRating}-star reputation built on {company.reviewCount} reviews, and minimal digital sophistication creates an unusual opportunity to acquire real cash flow and add meaningful value through basic operational improvements.
          </p>
        </Section>

        {/* Why this business */}
        <Section title="Why This Business">
          <ul className="space-y-2">
            {company.signals.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
                <span className="text-accent mt-0.5 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Financial Snapshot */}
        <Section title="Financial Snapshot">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: formatCurrency(company.revenue, true) },
              { label: 'EBITDA', value: formatCurrency(company.ebitda, true) },
              { label: 'SDE', value: formatCurrency(company.sde, true) },
              { label: 'Est. Valuation', value: formatCurrency(company.valuationEstimate, true) },
              { label: 'EBITDA Multiple', value: formatMultiple(ebitdaMultiple) },
              { label: 'SDE Multiple', value: formatMultiple(sdeMultiple) },
              { label: 'EBITDA Margin', value: `${((company.ebitda / company.revenue) * 100).toFixed(0)}%` },
              { label: 'Employees', value: String(company.employees) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide">{label}</p>
                <p className="text-[16px] font-semibold tabular-nums text-text-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* What we like */}
        <Section title="What We Like">
          <ul className="space-y-1.5">
            {[
              `${company.yearsOperating} years of continuous operation — durable, proven cash flow`,
              `${company.googleRating} Google rating with ${company.reviewCount} reviews — genuine customer satisfaction, not easily replicated`,
              `${company.recurringRevenue}% recurring revenue provides predictable income post-acquisition`,
              ...company.signals.slice(0, 2),
            ].map((item, i) => (
              <li key={i} className="text-[13px] text-text-primary flex items-start gap-2">
                <span className="text-positive flex-shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* What we don't like */}
        <Section title="What We Don&apos;t Like">
          <ul className="space-y-1.5">
            {company.acquisitionRisks.slice(0, 4).map((risk, i) => (
              <li key={i} className="text-[13px] text-text-primary flex items-start gap-2">
                <span className={`flex-shrink-0 mt-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  risk.severity === 'High' ? 'bg-negative-soft text-negative' :
                  risk.severity === 'Medium' ? 'bg-warning-soft text-warning' :
                  'bg-bg-subtle text-text-secondary'
                }`}>{risk.severity}</span>
                {risk.label}
              </li>
            ))}
          </ul>
        </Section>

        {/* Seller Situation */}
        <Section title="Seller Situation">
          <div className="flex flex-wrap gap-2 mb-2">
            {company.sellerSignals.map(s => (
              <span key={s} className="text-[12px] px-2.5 py-1 bg-bg-subtle rounded-lg text-text-secondary">{s}</span>
            ))}
          </div>
          <p className="text-[13px] text-text-secondary">{company.ownerName} has owned the business for {company.ownerTenure} years{company.founderOwned ? ' as the founder' : ''}.</p>
        </Section>

        {/* Marketing Opportunity */}
        <Section title="Marketing Opportunity">
          <ul className="space-y-1.5">
            {company.marketingOpportunities.map((o, i) => (
              <li key={i} className="text-[13px] text-text-primary flex items-start gap-2">
                <span className="text-info flex-shrink-0">→</span>
                {o}
              </li>
            ))}
          </ul>
        </Section>

        {/* AI + Automation */}
        <Section title="AI & Automation Opportunity">
          <ul className="space-y-1.5">
            {company.aiOpportunities.map((o, i) => (
              <li key={i} className="text-[13px] text-text-primary flex items-start gap-2">
                <span className="text-info flex-shrink-0">→</span>
                {o}
              </li>
            ))}
          </ul>
        </Section>

        {/* Cases */}
        <Section title="Scenarios">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Downside', desc: 'Revenue flat, no improvements, maintain staffing', rev: company.revenue * 0.95, ebitda: company.ebitda * 0.85 },
              { label: 'Base', desc: 'Moderate growth (3-5%), basic digital improvements', rev: company.revenue * 1.05, ebitda: company.ebitda * 1.1 },
              { label: 'Upside', desc: 'Full marketing stack, AI automation, new verticals', rev: company.revenue * 1.25, ebitda: company.ebitda * 1.35 },
            ].map(s => (
              <div key={s.label} className="p-3 bg-bg-subtle rounded-lg">
                <p className="text-[12px] font-semibold text-text-primary mb-1">{s.label}</p>
                <p className="text-[11px] text-text-secondary mb-2">{s.desc}</p>
                <p className="text-[13px] tabular-nums font-medium text-text-primary">{formatCurrency(s.rev, true)} rev</p>
                <p className="text-[12px] tabular-nums text-text-secondary">{formatCurrency(s.ebitda, true)} EBITDA</p>
              </div>
            ))}
          </div>
        </Section>

        {/* DD Items */}
        <Section title="Key Due Diligence Items">
          <ul className="space-y-1.5">
            {[
              'Last 3 years of tax returns + P&L',
              'Full customer list with contract terms and revenue history',
              'Employee list, compensation, tenure, and key person dependencies',
              'Equipment/asset list with age and condition',
              'All licenses and certifications — verify transferability',
              'Lease terms for any facilities',
              'Accounts receivable aging schedule',
              'Any pending litigation or regulatory issues',
            ].map((item, i) => (
              <li key={i} className="text-[13px] text-text-secondary flex items-start gap-2">
                <span className="w-4 h-4 rounded border border-border-default flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Recommendation */}
        <div className="mt-8 pt-6 border-t border-border-default">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-text-tertiary uppercase tracking-widest mb-1">Recommendation</p>
              <p className={`font-serif text-[36px] font-bold ${recColor}`}>{rec}</p>
            </div>
            <div className="flex-1 ml-4">
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {rec === 'PURSUE'
                  ? `${company.name} meets our acquisition criteria on all primary dimensions. We recommend moving to active outreach and financial verification. The combination of operational quality and digital underinvestment is exactly the profile we target.`
                  : rec === 'WATCH'
                  ? `${company.name} shows promise but requires more information or a more favorable valuation before committing resources. Continue monitoring and reassess in 90 days.`
                  : `${company.name} does not meet our minimum criteria at this time. File and revisit only if circumstances change materially.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Print button */}
        <div className="mt-8 pt-4 border-t border-border-subtle flex gap-3">
          <button
            onClick={() => window.print()}
            className="text-[12px] text-text-secondary hover:text-text-primary border border-border-default px-4 py-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            Print / Export PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[12px] text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg hover:bg-bg-hover transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-[18px] text-text-primary mb-3 pb-2 border-b border-border-subtle">{title}</h2>
      {children}
    </div>
  );
}
