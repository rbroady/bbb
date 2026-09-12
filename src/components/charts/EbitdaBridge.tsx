'use client';
import { formatCurrency } from '@/lib/formatting';
import { ValueInitiative } from '@/types';

interface Props {
  baseEbitda: number;
  initiatives: ValueInitiative[];
}

export function EbitdaBridge({ baseEbitda, initiatives }: Props) {
  const enabled = initiatives.filter(i => i.enabled);
  const totalLift = enabled.reduce((sum, i) => sum + i.ebitdaImpact - i.cost, 0);
  const totalCost = enabled.reduce((sum, i) => sum + i.cost, 0);
  const improvedEbitda = baseEbitda + totalLift;

  const maxBar = improvedEbitda + 50000;

  const items = [
    { label: 'Current EBITDA', value: baseEbitda, color: '#536B38', isBase: true },
    ...enabled.map(i => ({
      label: i.label,
      value: i.ebitdaImpact - i.cost,
      color: '#4F7045',
      isBase: false,
    })),
    { label: 'Cost of initiatives', value: -totalCost, color: '#9A493F', isBase: false },
  ];

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const width = Math.abs(item.value / maxBar) * 100;
        const isNegative = item.value < 0;
        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-[11px] text-text-secondary w-44 shrink-0 truncate">{item.label}</span>
            <div className="flex-1 relative h-6">
              <div
                className="absolute top-1 h-4 rounded-sm transition-all duration-500 flex items-center px-2"
                style={{
                  width: `${Math.max(width, 2)}%`,
                  backgroundColor: item.isBase ? '#E2E9D7' : isNegative ? '#F2DEDA' : '#E4ECE0',
                  borderLeft: item.isBase ? `3px solid ${item.color}` : `2px solid ${item.color}`,
                }}
              />
            </div>
            <span className={`text-[11px] tabular-nums font-medium w-20 text-right ${isNegative ? 'text-negative' : 'text-positive'}`}>
              {isNegative ? '−' : '+'}{formatCurrency(Math.abs(item.value), true)}
            </span>
          </div>
        );
      })}
      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[12px] font-semibold text-text-primary">Improved EBITDA</span>
        <span className="text-[14px] tabular-nums font-semibold text-accent">{formatCurrency(improvedEbitda)}</span>
      </div>
    </div>
  );
}
