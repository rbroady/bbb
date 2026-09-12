'use client';
import { companies, getCompaniesForHunt } from '@/data/companies';
import { OpportunityCard } from '@/components/features/OpportunityCard';
import { QualitySophisticationPlot } from '@/components/charts/QualitySophisticationPlot';

const huntCompanies = getCompaniesForHunt();

const primeCount = companies.filter(c => c.boringBizScore >= 85).length;
const newThisWeek = companies.filter(c => {
  const d = new Date(c.lastResearched);
  const cutoff = new Date('2026-09-05');
  return d >= cutoff;
}).length;
const offMarketCount = companies.filter(c => c.status === 'Off-market').length;
const avgScore = Math.round(companies.reduce((s, c) => s + c.boringBizScore, 0) / companies.length);

export default function HuntPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px]">
      {/* Morning brief header */}
      <div className="mb-5 md:mb-6">
        <p className="text-[11px] text-text-tertiary uppercase tracking-widest mb-1">Friday, September 12, 2026</p>
        <h1 className="text-[24px] md:text-[28px] font-semibold text-text-primary leading-tight">The Hunt</h1>
        <p className="text-[13px] md:text-[14px] text-text-secondary mt-1">This week&apos;s best opportunities.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6 py-3 px-4 bg-bg-surface border border-border-subtle rounded-lg mb-5 md:mb-6">
        {[
          { label: 'Prime targets', value: primeCount },
          { label: 'New this week', value: newThisWeek },
          { label: 'Off-market', value: offMarketCount },
          { label: 'Avg score', value: avgScore },
        ].map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-3">
            {i > 0 && <div className="hidden md:block w-px h-6 bg-border-subtle" />}
            <div>
              <p className="text-[11px] text-text-tertiary">{label}</p>
              <p className="text-[18px] font-semibold tabular-nums text-text-primary leading-none">{value}</p>
            </div>
          </div>
        ))}
        <div className="col-span-2 md:col-span-1 md:ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-positive rounded-full animate-pulse" />
          <span className="text-[11px] text-text-tertiary">Agents running</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Opportunity cards */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Opportunities This Week
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {huntCompanies.map(company => (
              <OpportunityCard key={company.id} company={company} />
            ))}
          </div>
        </div>

        {/* Scatter plot sidebar */}
        <div className="w-full lg:w-[280px] lg:flex-shrink-0">
          <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 lg:sticky lg:top-6">
            <h2 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Quality × Sophistication
            </h2>
            <p className="text-[11px] text-text-tertiary mb-3">Click a dot to open company</p>
            <QualitySophisticationPlot companies={companies} mini />
            <p className="text-[10px] text-text-tertiary mt-2 text-center">
              Top-left = prime targets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
