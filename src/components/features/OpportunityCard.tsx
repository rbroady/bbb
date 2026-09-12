'use client';
import { useRouter } from 'next/navigation';
import { Company } from '@/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatting';

interface Props {
  company: Company;
}

export function OpportunityCard({ company }: Props) {
  const router = useRouter();

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5 hover:border-border-default transition-colors duration-150 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors">
            {company.name}
          </h3>
          <p className="text-[12px] text-text-tertiary mt-0.5">
            {company.industry} · {company.city}, {company.state}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[28px] font-bold tabular-nums text-text-primary leading-none">
            {company.boringBizScore}
          </div>
          <StatusChip status={company.status} size="sm" />
        </div>
      </div>

      {/* Editorial summary */}
      <p className="text-[12px] text-text-secondary leading-relaxed mb-3 line-clamp-2">
        {company.editorialSummary}
      </p>

      {/* Signal tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {company.signals.slice(0, 4).map((signal) => (
          <span
            key={signal}
            className="text-[11px] px-2 py-0.5 rounded-md bg-bg-subtle text-text-secondary border border-border-subtle"
          >
            {signal}
          </span>
        ))}
      </div>

      {/* Financials */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border-subtle">
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Revenue</p>
          <p className="text-[12px] font-medium tabular-nums text-text-primary">{formatCurrency(company.revenue, true)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">EBITDA</p>
          <p className="text-[12px] font-medium tabular-nums text-text-primary">{formatCurrency(company.ebitda, true)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Est. Value</p>
          <p className="text-[12px] font-medium tabular-nums text-text-primary">{formatCurrency(company.valuationEstimate, true)}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[12px] text-warning">{'★'.repeat(Math.round(company.googleRating))}</span>
          <span className="text-[11px] tabular-nums text-text-tertiary">{company.googleRating} ({company.reviewCount})</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/targets/${company.id}`)}
          className="text-[11px]"
        >
          View company
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push('/deal-analyzer')}
          className="text-[11px]"
        >
          Analyze deal
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push('/pipeline')}
          className="text-[11px]"
        >
          Add to pipeline
        </Button>
      </div>
    </div>
  );
}
