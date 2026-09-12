'use client';
import { useAppStore } from '@/store/useAppStore';
import { EbitdaBridge } from '@/components/charts/EbitdaBridge';
import { formatCurrency } from '@/lib/formatting';

interface Props {
  baseEbitda: number;
}

export function ValueCreation({ baseEbitda }: Props) {
  const { initiatives, toggleInitiative } = useAppStore();

  const enabledInitiatives = initiatives.filter(i => i.enabled);
  const totalEbitdaLift = enabledInitiatives.reduce((sum, i) => sum + i.ebitdaImpact, 0);
  const totalCost = enabledInitiatives.reduce((sum, i) => sum + i.cost, 0);
  const netLift = totalEbitdaLift - totalCost;

  const categories = [...new Set(initiatives.map(i => i.category))];

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-3">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">EBITDA lift</p>
          <p className="text-[18px] font-bold tabular-nums text-positive">{formatCurrency(totalEbitdaLift, true)}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-3">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Initiative costs</p>
          <p className="text-[18px] font-bold tabular-nums text-warning">{formatCurrency(totalCost, true)}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-3">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Net improvement</p>
          <p className={`text-[18px] font-bold tabular-nums ${netLift >= 0 ? 'text-accent' : 'text-negative'}`}>
            {formatCurrency(netLift, true)}
          </p>
        </div>
      </div>

      {/* Initiatives list */}
      <div className="mb-6">
        {categories.map(cat => (
          <div key={cat} className="mb-4">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">{cat}</p>
            <div className="space-y-2">
              {initiatives.filter(i => i.category === cat).map(initiative => (
                <div
                  key={initiative.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                    transition-colors duration-100
                    ${initiative.enabled
                      ? 'bg-accent-softer border-accent/30'
                      : 'bg-bg-surface border-border-subtle hover:border-border-default'
                    }
                  `}
                  onClick={() => toggleInitiative(initiative.id)}
                >
                  <div className={`
                    w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors
                    ${initiative.enabled ? 'bg-accent border-accent' : 'border-border-strong'}
                  `}>
                    {initiative.enabled && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-text-primary">{initiative.label}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div>
                      <p className="text-[10px] text-text-tertiary">Cost</p>
                      <p className="text-[11px] tabular-nums text-warning font-medium">
                        {formatCurrency(initiative.cost, true)}/yr
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-tertiary">EBITDA lift</p>
                      <p className="text-[11px] tabular-nums text-positive font-medium">
                        +{formatCurrency(initiative.ebitdaImpact, true)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* EBITDA Bridge */}
      <div>
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">EBITDA Bridge</p>
        <EbitdaBridge baseEbitda={baseEbitda} initiatives={initiatives} />
      </div>
    </div>
  );
}
