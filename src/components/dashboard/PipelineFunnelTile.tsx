'use client';
import { useRouter } from 'next/navigation';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { formatCurrency } from '@/lib/formatting';

const STAGE_LABELS: Record<CompanyStatus, string> = {
  new: 'New', saved: 'Saved', passed: 'Passed',
  contacted: 'Contacted', evaluating: 'Evaluating',
  loi: 'LOI', diligence: 'Diligence', closed: 'Closed',
};

const STAGE_COLORS: Record<CompanyStatus, string> = {
  new: '#3d3d3d', saved: '#52a94a', passed: '#2e2e2e',
  contacted: '#5090c8', evaluating: '#d49540',
  loi: '#d45050', diligence: '#c04040', closed: '#c8c8c8',
};

interface Props {
  companies: Company[];
  getStatus: (c: Company) => CompanyStatus;
}

export function PipelineFunnelTile({ companies, getStatus }: Props) {
  const router = useRouter();
  const pipeline = companies.filter(c => PIPELINE_STATUSES.includes(getStatus(c)));

  const stages = PIPELINE_STATUSES.map(stage => {
    const cos = pipeline.filter(c => getStatus(c) === stage);
    const value = cos.reduce((s, c) => s + (c.askingPrice ?? c.valuationEstimate), 0);
    return { stage, count: cos.length, value };
  }).filter(s => s.count > 0);

  const maxCount = Math.max(...stages.map(s => s.count), 1);
  const total = pipeline.reduce((s, c) => s + (c.askingPrice ?? c.valuationEstimate), 0);

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[32px] font-bold tabular-nums text-text-primary leading-none">{pipeline.length}</span>
        <span className="text-[12px] text-text-tertiary">{formatCurrency(total, true)} tracked</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {stages.map(({ stage, count, value }) => (
          <button
            key={stage}
            onClick={() => router.push('/pipeline')}
            className="group flex items-center gap-2.5 w-full text-left hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] text-text-tertiary w-[72px] flex-shrink-0 text-right tabular-nums">
              {STAGE_LABELS[stage as CompanyStatus]}
            </span>
            <div className="flex-1 h-5 bg-bg-subtle rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: STAGE_COLORS[stage as CompanyStatus],
                  opacity: 0.8,
                }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-text-secondary w-6 text-center flex-shrink-0">{count}</span>
            <span className="text-[10px] tabular-nums text-text-tertiary w-14 flex-shrink-0">
              {value > 0 ? formatCurrency(value, true) : ''}
            </span>
          </button>
        ))}
      </div>

      {stages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[12px] text-text-disabled">No pipeline yet</p>
        </div>
      )}
    </div>
  );
}
