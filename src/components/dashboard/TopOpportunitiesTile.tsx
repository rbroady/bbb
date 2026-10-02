'use client';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { Company, CompanyStatus } from '@/types';
import { formatCurrency } from '@/lib/formatting';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  companies: Company[];
  getStatus: (c: Company) => CompanyStatus;
}

export function TopOpportunitiesTile({ companies, getStatus }: Props) {
  const router = useRouter();
  const setCompanyStatus = useAppStore(s => s.setCompanyStatus);

  const top = companies
    .filter(c => getStatus(c) === 'new')
    .sort((a, b) => b.boringBizScore - a.boringBizScore)
    .slice(0, 5);

  if (top.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[12px] text-text-disabled">All companies reviewed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-0">
      {top.map((c, i) => (
        <div
          key={c.id}
          className={`flex items-center gap-2.5 py-2 group ${i < top.length - 1 ? 'border-b border-border-subtle' : ''}`}
        >
          <span className={`text-[18px] font-bold tabular-nums w-8 flex-shrink-0 text-right ${
            c.boringBizScore >= 85 ? 'text-positive' : c.boringBizScore >= 70 ? 'text-warning' : 'text-text-secondary'
          }`}>
            {c.boringBizScore}
          </span>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => router.push(`/company/${c.id}`)}
          >
            <p className="text-[12px] font-medium text-text-primary truncate group-hover:text-accent transition-colors">
              {c.name}
            </p>
            <p className="text-[10px] text-text-tertiary truncate">
              {c.industry} · {c.city}, {c.state}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] tabular-nums text-text-secondary">
              {formatCurrency(c.askingPrice ?? c.valuationEstimate, true)}
            </p>
          </div>
          <button
            onClick={() => setCompanyStatus(c.id, 'saved')}
            className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-hover text-text-tertiary hover:text-text-primary"
            title="Save"
          >
            <Bookmark size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
