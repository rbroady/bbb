'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAllCompanies } from '@/lib/useAllCompanies';
import { useAppStore } from '@/store/useAppStore';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { formatCurrency } from '@/lib/formatting';
import { getScoreLabel, getScoreColor } from '@/lib/scoring';
import { Search, SlidersHorizontal, Bookmark, X, ChevronRight } from 'lucide-react';

type ViewTab = 'new' | 'saved' | 'passed';

function WhyCard({ signals, sellerSignals }: { signals: string[]; sellerSignals: string[] }) {
  const reasons = [...sellerSignals.slice(0, 2), ...signals.slice(0, 1)].slice(0, 3);
  if (reasons.length === 0) return null;
  return (
    <div className="space-y-1 mb-3">
      {reasons.map((r, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
          <span className="text-[11px] text-text-secondary leading-[1.4]">{r}</span>
        </div>
      ))}
    </div>
  );
}

function DiscoverCard({ company, onSave, onPass }: {
  company: Company;
  onSave: () => void;
  onPass: () => void;
}) {
  const router = useRouter();
  const scoreColor = getScoreColor(company.boringBizScore);
  const scoreLabel = getScoreLabel(company.boringBizScore);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 hover:border-border-default transition-colors group">
      <div
        className="cursor-pointer"
        onClick={() => router.push(`/company/${company.id}`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-[14px] font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors truncate">
              {company.name}
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">{company.industry} · {company.city}, {company.state}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className={`text-[26px] font-bold tabular-nums leading-none ${scoreColor}`}>{company.boringBizScore}</p>
            <p className="text-[10px] text-text-tertiary mt-0.5">{scoreLabel}</p>
          </div>
        </div>

        {/* Editorial */}
        <p className="text-[12px] text-text-secondary leading-relaxed mb-2.5 line-clamp-2">
          {company.editorialSummary}
        </p>

        {/* Why It Surfaced */}
        <WhyCard signals={company.signals} sellerSignals={company.sellerSignals} />

        {/* Key stats */}
        <div className="flex items-center gap-4 py-2.5 border-t border-border-subtle mb-2.5">
          <div>
            <p className="text-[10px] text-text-tertiary">Revenue</p>
            <p className="text-[12px] font-medium tabular-nums">{formatCurrency(company.revenue, true)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary">EBITDA</p>
            <p className="text-[12px] font-medium tabular-nums">{formatCurrency(company.ebitda, true)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary">Est. Value</p>
            <p className="text-[12px] font-medium tabular-nums">{formatCurrency(company.valuationEstimate, true)}</p>
          </div>
          <div className="ml-auto">
            <p className="text-[12px] tabular-nums text-warning">★ {company.googleRating}</p>
            <p className="text-[10px] text-text-tertiary">{company.reviewCount} reviews</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {company.status === 'new' && (
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-accent text-text-inverse font-medium hover:bg-accent-hover transition-colors"
          >
            <Bookmark size={12} />
            Save
          </button>
          <button
            onClick={onPass}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-border-default text-text-secondary font-medium hover:bg-bg-hover transition-colors"
          >
            <X size={12} />
            Pass
          </button>
          <button
            onClick={() => router.push(`/company/${company.id}`)}
            className="ml-auto flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            View details <ChevronRight size={11} />
          </button>
        </div>
      )}
      {company.status === 'saved' && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-accent font-medium">Saved</span>
          <span className="text-text-disabled">·</span>
          <button
            onClick={onPass}
            className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Remove
          </button>
          <button
            onClick={() => router.push(`/company/${company.id}`)}
            className="ml-auto flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            View details <ChevronRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  const allCompanies = useAllCompanies();
  const { companyStatuses, setCompanyStatus } = useAppStore();
  const [tab, setTab] = useState<ViewTab>('new');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');

  const getStatus = (c: Company): CompanyStatus =>
    (companyStatuses[c.id] as CompanyStatus) ?? c.status;

  const INDUSTRIES = useMemo(() => [...new Set(allCompanies.map(c => c.industry))].sort(), [allCompanies]);

  const newCount = useMemo(() => allCompanies.filter(c => getStatus(c) === 'new').length, [allCompanies, companyStatuses]);
  const savedCount = useMemo(() => allCompanies.filter(c => getStatus(c) === 'saved').length, [allCompanies, companyStatuses]);
  const passedCount = useMemo(() => allCompanies.filter(c => getStatus(c) === 'passed').length, [allCompanies, companyStatuses]);

  const filtered = useMemo(() => {
    return allCompanies
      .filter(c => {
        const s = getStatus(c);
        if (tab === 'new') return s === 'new';
        if (tab === 'saved') return s === 'saved';
        if (tab === 'passed') return s === 'passed';
        return true;
      })
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
      .filter(c => !industry || c.industry === industry)
      .sort((a, b) => b.boringBizScore - a.boringBizScore);
  }, [allCompanies, companyStatuses, tab, search, industry]);

  const pipelineCount = useMemo(() =>
    allCompanies.filter(c => PIPELINE_STATUSES.includes(getStatus(c))).length,
    [allCompanies, companyStatuses]
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[24px] md:text-[28px] font-semibold text-text-primary leading-tight">Discover</h1>
        <p className="text-[13px] text-text-secondary mt-1">
          {allCompanies.length} businesses tracked · {pipelineCount} in pipeline
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-4 border-b border-border-subtle pb-0 -mx-0.5">
        {([
          { key: 'new' as ViewTab, label: 'New', count: newCount },
          { key: 'saved' as ViewTab, label: 'Saved', count: savedCount },
          { key: 'passed' as ViewTab, label: 'Passed', count: passedCount },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
            <span className="ml-1.5 text-[11px] tabular-nums text-text-tertiary">{count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary w-full sm:w-44"
          />
        </div>
        <select
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          className="h-8 px-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-secondary appearance-none cursor-pointer"
        >
          <option value="">All industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        {(search || industry) && (
          <button
            onClick={() => { setSearch(''); setIndustry(''); }}
            className="text-[11px] text-text-tertiary hover:text-text-secondary px-2 py-1"
          >
            Clear
          </button>
        )}
        <div className="ml-auto flex items-center gap-1 text-[11px] text-text-tertiary">
          <SlidersHorizontal size={11} />
          {filtered.length} results
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtered.map(company => (
            <DiscoverCard
              key={company.id}
              company={{ ...company, status: getStatus(company) }}
              onSave={() => setCompanyStatus(company.id, 'saved')}
              onPass={() => setCompanyStatus(company.id, 'passed')}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="font-serif text-[18px] text-text-secondary">Nothing here.</p>
          <p className="text-[13px] text-text-tertiary mt-1">
            {tab === 'new' ? 'All companies have been reviewed.' :
             tab === 'saved' ? 'No saved companies yet. Save some from the New tab.' :
             'No passed companies.'}
          </p>
        </div>
      )}
    </div>
  );
}
