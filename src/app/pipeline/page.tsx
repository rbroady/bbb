'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAllCompanies } from '@/lib/useAllCompanies';
import { useAppStore } from '@/store/useAppStore';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { formatCurrency } from '@/lib/formatting';
import { TableIcon, KanbanSquare, ChevronRight } from 'lucide-react';

const STAGE_LABELS: Record<CompanyStatus, string> = {
  new: 'New',
  saved: 'Saved',
  passed: 'Passed',
  contacted: 'Contacted',
  evaluating: 'Evaluating',
  loi: 'LOI',
  diligence: 'Diligence',
  closed: 'Closed',
};

const STAGE_COLORS: Partial<Record<CompanyStatus, string>> = {
  saved: 'border-border-default',
  contacted: 'border-info/50',
  evaluating: 'border-warning/50',
  loi: 'border-positive/50',
  diligence: 'border-positive/70',
  closed: 'border-accent/60',
};

function PipelineCard({ company, onMove }: { company: Company; onMove: (stage: CompanyStatus) => void }) {
  const router = useRouter();
  const [showMove, setShowMove] = useState(false);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-3 hover:border-border-default transition-colors group relative">
      <div className="cursor-pointer" onClick={() => router.push(`/company/${company.id}`)}>
        <div className="flex items-start justify-between mb-1.5">
          <p className="text-[12px] font-semibold text-text-primary leading-[1.2] group-hover:text-accent transition-colors">
            {company.name}
          </p>
          <span className={`text-[14px] font-bold tabular-nums ml-2 flex-shrink-0 ${
            company.boringBizScore >= 85 ? 'text-accent' :
            company.boringBizScore >= 70 ? 'text-warning' :
            'text-text-secondary'
          }`}>{company.boringBizScore}</span>
        </div>
        <p className="text-[10px] text-text-tertiary mb-1.5">{company.industry} · {company.city}, {company.state}</p>
        <p className="text-[11px] tabular-nums text-text-secondary">
          {company.askingPrice ? formatCurrency(company.askingPrice, true) : formatCurrency(company.valuationEstimate, true)}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setShowMove(v => !v); }}
        className="mt-2 w-full text-[10px] text-text-tertiary hover:text-text-secondary flex items-center justify-center gap-1 py-0.5"
      >
        Move stage <ChevronRight size={10} className={showMove ? 'rotate-90' : ''} />
      </button>

      {showMove && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-bg-surface border border-border-default rounded-lg shadow-lg py-1">
          {PIPELINE_STATUSES.map(stage => (
            <button
              key={stage}
              onClick={() => { onMove(stage); setShowMove(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type ViewMode = 'kanban' | 'table';

export default function PipelinePage() {
  const router = useRouter();
  const { companyStatuses, setCompanyStatus } = useAppStore();
  const allCompanies = useAllCompanies();
  const [view, setView] = useState<ViewMode>('kanban');

  const getStatus = (c: Company): CompanyStatus =>
    (companyStatuses[c.id] as CompanyStatus) ?? c.status;

  const pipelineCompanies = allCompanies.filter(c => PIPELINE_STATUSES.includes(getStatus(c)));

  const companiesInStage = (stage: CompanyStatus) =>
    pipelineCompanies.filter(c => getStatus(c) === stage);

  const totalValue = pipelineCompanies
    .filter(c => getStatus(c) !== 'closed')
    .reduce((s, c) => s + (c.askingPrice ?? c.valuationEstimate), 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Pipeline</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            {pipelineCompanies.length} companies · {formatCurrency(totalValue, true)} tracked value
          </p>
        </div>
        <div className="flex gap-1 bg-bg-subtle rounded-lg p-0.5">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'kanban' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <KanbanSquare size={13} />Kanban
          </button>
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'table' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TableIcon size={13} />Table
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STATUSES.map(stage => {
            const cols = companiesInStage(stage);
            return (
              <div
                key={stage}
                className={`flex-shrink-0 w-[240px] rounded-[10px] border-t-2 bg-bg-subtle ${STAGE_COLORS[stage] ?? 'border-border-default'}`}
              >
                <div className="px-3 py-2.5 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-text-secondary">{STAGE_LABELS[stage]}</p>
                    {cols.length > 0 && (
                      <span className="text-[10px] bg-bg-hover text-text-tertiary rounded-full px-1.5 py-0.5 tabular-nums">
                        {cols.length}
                      </span>
                    )}
                  </div>
                  {cols.length > 0 && (
                    <p className="text-[10px] text-text-tertiary mt-0.5 tabular-nums">
                      {formatCurrency(cols.reduce((s, c) => s + (c.askingPrice ?? c.valuationEstimate), 0), true)}
                    </p>
                  )}
                </div>
                <div className="p-2 space-y-2 min-h-[100px]">
                  {cols.map(company => (
                    <PipelineCard
                      key={company.id}
                      company={company}
                      onMove={(stage) => setCompanyStatus(company.id, stage)}
                    />
                  ))}
                  {cols.length === 0 && (
                    <p className="text-center text-[11px] text-text-disabled py-4">Empty</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-subtle border-b border-border-subtle">
              <tr>
                {['Company', 'Industry', 'Location', 'Score', 'Value', 'Stage'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipelineCompanies
                .sort((a, b) => PIPELINE_STATUSES.indexOf(getStatus(a)) - PIPELINE_STATUSES.indexOf(getStatus(b)))
                .map((company, idx) => (
                <tr
                  key={company.id}
                  onClick={() => router.push(`/company/${company.id}`)}
                  className={`cursor-pointer hover:bg-bg-hover transition-colors ${idx % 2 === 0 ? '' : 'bg-bg-canvas/50'}`}
                  style={{ height: 42 }}
                >
                  <td className="px-3 text-[13px] font-medium text-text-primary hover:text-accent">{company.name}</td>
                  <td className="px-3 text-[12px] text-text-secondary">{company.industry}</td>
                  <td className="px-3 text-[12px] text-text-secondary">{company.city}, {company.state}</td>
                  <td className="px-3">
                    <span className={`text-[14px] font-bold tabular-nums ${
                      company.boringBizScore >= 85 ? 'text-accent' :
                      company.boringBizScore >= 70 ? 'text-warning' :
                      'text-text-secondary'
                    }`}>{company.boringBizScore}</span>
                  </td>
                  <td className="px-3 text-[12px] tabular-nums text-text-primary">
                    {formatCurrency(company.askingPrice ?? company.valuationEstimate, true)}
                  </td>
                  <td className="px-3"><StatusChip status={getStatus(company)} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pipelineCompanies.length === 0 && (
        <div className="mt-6 p-6 bg-bg-subtle rounded-lg border border-border-subtle text-center">
          <p className="text-[13px] text-text-tertiary">
            No companies in your pipeline yet.{' '}
            <button onClick={() => router.push('/')} className="text-accent hover:underline">
              Go to Discover
            </button>{' '}
            to save companies.
          </p>
        </div>
      )}
    </div>
  );
}
