'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { companies } from '@/data/companies';
import { Company, CompanyStatus } from '@/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { QualitySophisticationPlot } from '@/components/charts/QualitySophisticationPlot';
import { formatCurrency, formatRelativeDate, websiteQualityLabel } from '@/lib/formatting';
import { Search, SlidersHorizontal, BarChart2, TableIcon } from 'lucide-react';

const VIEWS: { label: string; filter: (c: Company) => boolean }[] = [
  { label: 'All', filter: () => true },
  { label: 'Prime', filter: c => c.boringBizScore >= 85 },
  { label: 'Off-Market', filter: c => c.status === 'Off-market' },
  { label: 'For Sale', filter: c => c.status === 'For sale' },
  { label: 'Watching', filter: c => c.status === 'Watching' },
  { label: 'Contacted', filter: c => c.status === 'Contacted' },
  { label: 'Analyzing', filter: c => c.status === 'Analyzing' || c.pipelineStage === 'Analyzing' },
  { label: 'LOI', filter: c => c.pipelineStage === 'LOI' },
  { label: 'Passed', filter: c => c.status === 'Passed' },
];

const INDUSTRIES = [...new Set(companies.map(c => c.industry))].sort();
const STATES = [...new Set(companies.map(c => c.state))].sort();

export default function TargetsPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('All');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [state, setState] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [showPlot, setShowPlot] = useState(false);
  const [sortCol, setSortCol] = useState<keyof Company>('boringBizScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const viewFilter = VIEWS.find(v => v.label === activeView)?.filter ?? (() => true);

  const filtered = useMemo(() => {
    return companies
      .filter(viewFilter)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
      .filter(c => !industry || c.industry === industry)
      .filter(c => !state || c.state === state)
      .filter(c => c.boringBizScore >= minScore)
      .sort((a, b) => {
        const av = a[sortCol] as number | string;
        const bv = b[sortCol] as number | string;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [activeView, search, industry, state, minScore, sortCol, sortDir, viewFilter]);

  const handleSort = (col: keyof Company) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const Th = ({ label, col }: { label: string; col: keyof Company }) => (
    <th
      onClick={() => handleSort(col)}
      className="text-left px-3 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary select-none whitespace-nowrap"
    >
      {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Targets</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">{companies.length} companies tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlot(v => !v)}
            className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showPlot ? 'bg-accent-soft text-accent-ink border-accent/30' : 'bg-bg-surface border-border-default text-text-secondary hover:bg-bg-hover'
            }`}
          >
            <BarChart2 size={13} />
            Plot
          </button>
          <button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border bg-bg-surface border-border-default text-text-secondary hover:bg-bg-hover font-medium">
            <TableIcon size={13} />
            Table
          </button>
        </div>
      </div>

      {/* Scatter plot (toggle) */}
      {showPlot && (
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5 mb-5">
          <QualitySophisticationPlot companies={filtered} />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary w-44"
          />
        </div>

        <select
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          className="h-8 px-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-secondary appearance-none cursor-pointer"
        >
          <option value="">Industry</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="h-8 px-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-secondary appearance-none cursor-pointer"
        >
          <option value="">State</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={minScore}
          onChange={e => setMinScore(parseInt(e.target.value))}
          className="h-8 px-3 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-secondary appearance-none cursor-pointer"
        >
          <option value={0}>All scores</option>
          <option value={80}>Score 80+</option>
          <option value={70}>Score 70+</option>
          <option value={60}>Score 60+</option>
        </select>

        {(search || industry || state || minScore > 0) && (
          <button
            onClick={() => { setSearch(''); setIndustry(''); setState(''); setMinScore(0); }}
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

      {/* Views */}
      <div className="flex gap-0.5 mb-3">
        {VIEWS.map(v => (
          <button
            key={v.label}
            onClick={() => setActiveView(v.label)}
            className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeView === v.label
                ? 'bg-bg-active text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {v.label}
            <span className="ml-1.5 text-[10px] tabular-nums text-text-tertiary">
              {companies.filter(v.filter).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-subtle border-b border-border-subtle">
              <tr>
                <Th label="Company" col="name" />
                <Th label="Industry" col="industry" />
                <Th label="Location" col="city" />
                <Th label="Score" col="boringBizScore" />
                <Th label="Revenue" col="revenue" />
                <Th label="EBITDA" col="ebitda" />
                <Th label="Yrs Op." col="yearsOperating" />
                <Th label="Reviews" col="googleRating" />
                <Th label="Website" col="websiteQuality" />
                <Th label="Status" col="status" />
                <Th label="Researched" col="lastResearched" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((company, idx) => (
                <tr
                  key={company.id}
                  onClick={() => router.push(`/targets/${company.id}`)}
                  className={`cursor-pointer hover:bg-bg-hover transition-colors ${idx % 2 === 0 ? '' : 'bg-bg-canvas/50'}`}
                  style={{ height: 42 }}
                >
                  <td className="px-3" style={{ minWidth: '210px' }}>
                    <span className="text-[13px] font-medium text-text-primary hover:text-accent leading-[1.2]">{company.name}</span>
                  </td>
                  <td className="px-3 text-[12px] text-text-secondary whitespace-nowrap">{company.industry}</td>
                  <td className="px-3 text-[12px] text-text-secondary whitespace-nowrap">{company.city}, {company.state}</td>
                  <td className="px-3">
                    <span className={`text-[14px] font-bold tabular-nums ${
                      company.boringBizScore >= 85 ? 'text-accent' :
                      company.boringBizScore >= 70 ? 'text-warning' :
                      'text-text-secondary'
                    }`}>
                      {company.boringBizScore}
                    </span>
                  </td>
                  <td className="px-3 text-[12px] tabular-nums text-text-primary">{formatCurrency(company.revenue, true)}</td>
                  <td className="px-3 text-[12px] tabular-nums text-text-primary">{formatCurrency(company.ebitda, true)}</td>
                  <td className="px-3 text-[12px] tabular-nums text-text-secondary">{company.yearsOperating}y</td>
                  <td className="px-3 whitespace-nowrap">
                    <span className="text-[12px] tabular-nums">{company.googleRating}</span>
                    <span className="text-warning text-[11px] ml-0.5">★</span>
                    <span className="text-text-tertiary mx-1">/</span>
                    <span className="text-[12px] tabular-nums text-text-secondary">{company.reviewCount}</span>
                  </td>
                  <td className="px-3 text-[11px] text-text-tertiary">{websiteQualityLabel(company.websiteQuality)}</td>
                  <td className="px-3"><StatusChip status={company.status} size="sm" /></td>
                  <td className="px-3 text-[11px] text-text-tertiary whitespace-nowrap">{formatRelativeDate(company.lastResearched)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-[18px] text-text-secondary">Nothing here.</p>
              <p className="text-[13px] text-text-tertiary mt-1">Adjust your filters to see more companies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
