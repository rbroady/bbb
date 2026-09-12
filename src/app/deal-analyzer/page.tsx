'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateDealMetrics } from '@/lib/calculations';
import { DealInputsPanel } from '@/components/features/DealInputs';
import { DealResultsPanel } from '@/components/features/DealResults';
import { ValueCreation } from '@/components/features/ValueCreation';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

type Tab = 'analysis' | 'value-creation';

export default function DealAnalyzerPage() {
  const { dealInputs, resetDealInputs } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  const results = calculateDealMetrics(dealInputs);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Deal Analyzer</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Model acquisition economics in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex gap-0.5 bg-bg-subtle rounded-lg p-0.5">
            {[
              { id: 'analysis' as Tab, label: 'Analysis' },
              { id: 'value-creation' as Tab, label: 'Value Creation' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={resetDealInputs}>
            <RefreshCw size={12} />
            Reset
          </Button>
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Inputs */}
          <div className="w-full lg:w-[42%] lg:flex-shrink-0">
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5">
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Inputs</p>
              <DealInputsPanel />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5 lg:sticky lg:top-20">
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Results</p>
              <DealResultsPanel results={results} inputs={dealInputs} />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[820px]">
          <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Value Creation</p>
            <p className="text-[12px] text-text-tertiary mb-4">Toggle initiatives to see their impact on EBITDA and valuation.</p>
            <ValueCreation baseEbitda={dealInputs.ebitda} />
          </div>
        </div>
      )}
    </div>
  );
}
