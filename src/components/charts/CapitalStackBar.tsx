'use client';
import { formatCurrency } from '@/lib/formatting';

interface CapitalSegment {
  label: string;
  value: number;
  color: string;
  textColor?: string;
}

interface Props {
  segments: CapitalSegment[];
  total: number;
}

export function CapitalStackBar({ segments, total }: Props) {
  return (
    <div>
      <div className="flex w-full rounded-lg overflow-hidden h-8">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          if (pct < 1) return null;
          return (
            <div
              key={seg.label}
              className="flex items-center justify-center text-[11px] font-medium transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
                color: seg.textColor ?? '#fff',
              }}
              title={`${seg.label}: ${formatCurrency(seg.value)}`}
            >
              {pct > 12 && seg.label}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <div key={seg.label} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
              {seg.label}
              <span className="tabular-nums text-text-primary font-medium">{formatCurrency(seg.value, true)}</span>
              <span className="text-text-tertiary">({pct.toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
