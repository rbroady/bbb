'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { agents } from '@/data/agents';
import { AgentCard } from '@/components/features/AgentCard';
import { formatCurrency } from '@/lib/formatting';

type SettingsTab = 'buybox' | 'deal-defaults' | 'research';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5 mb-4">
      <h3 className="text-[13px] font-semibold text-text-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between py-3 border-b border-border-subtle last:border-0 gap-x-4 gap-y-2">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[13px] text-text-primary">{label}</p>
        {sub && <p className="text-[11px] text-text-tertiary mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, prefix = '', suffix = '', min, max }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; min?: number; max?: number;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-2.5 text-[12px] text-text-tertiary z-10">{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className={`w-28 h-8 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary tabular-nums text-right ${prefix ? 'pl-6 pr-2' : 'pl-3'} ${suffix ? 'pr-7' : 'pr-2'}`}
      />
      {suffix && <span className="absolute right-2.5 text-[12px] text-text-tertiary">{suffix}</span>}
    </div>
  );
}

function TagList({ items, onAdd, onRemove, placeholder }: {
  items: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string;
}) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map(item => (
          <span key={item} className="flex items-center gap-1 text-[12px] px-2 py-0.5 bg-bg-subtle border border-border-subtle rounded-full text-text-secondary">
            {item}
            <button onClick={() => onRemove(item)} className="text-text-tertiary hover:text-negative ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { onAdd(input.trim()); setInput(''); } }}
          placeholder={placeholder}
          className="h-7 px-2.5 text-[12px] bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary flex-1"
        />
        <button
          onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); } }}
          className="text-[12px] px-2.5 py-1 rounded-lg bg-accent text-text-inverse hover:bg-accent-hover transition-colors"
        >Add</button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('buybox');
  const { buyBox, setBuyBox, resetBuyBox, dealInputs, setDealInputs, resetDealInputs } = useAppStore();

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'buybox', label: 'Buy Box' },
    { key: 'deal-defaults', label: 'Deal Defaults' },
    { key: 'research', label: 'Research Agents' },
  ];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[820px]">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold text-text-primary">Settings</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Configure your acquisition criteria and research agents.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border-subtle mb-6 -mx-0.5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BUY BOX ── */}
      {tab === 'buybox' && (
        <div>
          <SettingsSection title="Hard Constraints">
            <p className="text-[12px] text-text-tertiary mb-4">Companies outside these ranges won't fit. Used directly in fit scoring.</p>
            <FieldRow label="Price Range" sub="Min and max acquisition price">
              <div className="flex items-center gap-2">
                <NumberInput value={buyBox.minPrice / 1000} onChange={v => setBuyBox({ minPrice: v * 1000 })} prefix="$" suffix="K" />
                <span className="text-text-tertiary text-[12px]">–</span>
                <NumberInput value={buyBox.maxPrice / 1000} onChange={v => setBuyBox({ maxPrice: v * 1000 })} prefix="$" suffix="K" />
              </div>
            </FieldRow>
            <FieldRow label="Revenue Range">
              <div className="flex items-center gap-2">
                <NumberInput value={buyBox.minRevenue / 1000} onChange={v => setBuyBox({ minRevenue: v * 1000 })} prefix="$" suffix="K" />
                <span className="text-text-tertiary text-[12px]">–</span>
                <NumberInput value={buyBox.maxRevenue / 1000} onChange={v => setBuyBox({ maxRevenue: v * 1000 })} prefix="$" suffix="K" />
              </div>
            </FieldRow>
            <FieldRow label="Min EBITDA">
              <NumberInput value={buyBox.minEbitda / 1000} onChange={v => setBuyBox({ minEbitda: v * 1000 })} prefix="$" suffix="K" />
            </FieldRow>
            <FieldRow label="Min EBITDA Margin" sub="Gross margin floor">
              <NumberInput value={buyBox.minMargin} onChange={v => setBuyBox({ minMargin: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Max Customer Concentration">
              <NumberInput value={buyBox.maxCustomerConcentration} onChange={v => setBuyBox({ maxCustomerConcentration: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Target Multiple" sub="EBITDA acquisition multiple">
              <NumberInput value={buyBox.targetMultiple} onChange={v => setBuyBox({ targetMultiple: v })} suffix="x" />
            </FieldRow>
          </SettingsSection>

          <SettingsSection title="Target Industries">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-medium text-positive mb-2">Strong fit</p>
                <TagList
                  items={buyBox.targetIndustries}
                  onAdd={v => setBuyBox({ targetIndustries: [...buyBox.targetIndustries, v] })}
                  onRemove={v => setBuyBox({ targetIndustries: buyBox.targetIndustries.filter(i => i !== v) })}
                  placeholder="Add industry…"
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-warning mb-2">Maybe</p>
                <TagList
                  items={buyBox.maybeIndustries}
                  onAdd={v => setBuyBox({ maybeIndustries: [...buyBox.maybeIndustries, v] })}
                  onRemove={v => setBuyBox({ maybeIndustries: buyBox.maybeIndustries.filter(i => i !== v) })}
                  placeholder="Add industry…"
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-negative mb-2">Avoid</p>
                <TagList
                  items={buyBox.avoidIndustries}
                  onAdd={v => setBuyBox({ avoidIndustries: [...buyBox.avoidIndustries, v] })}
                  onRemove={v => setBuyBox({ avoidIndustries: buyBox.avoidIndustries.filter(i => i !== v) })}
                  placeholder="Add industry…"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Geography">
            <FieldRow label="Target States">
              <TagList
                items={buyBox.targetStates}
                onAdd={v => setBuyBox({ targetStates: [...buyBox.targetStates, v] })}
                onRemove={v => setBuyBox({ targetStates: buyBox.targetStates.filter(s => s !== v) })}
                placeholder="e.g. OR"
              />
            </FieldRow>
          </SettingsSection>

          <SettingsSection title="Preferences">
            <p className="text-[12px] text-text-tertiary mb-4">Soft preferences — won't exclude companies but affect scoring.</p>
            <FieldRow label="Min Recurring Revenue">
              <NumberInput value={buyBox.minRecurringRevenue} onChange={v => setBuyBox({ minRecurringRevenue: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Seller Situations" sub="Types of motivated sellers you're looking for">
              <TagList
                items={buyBox.sellerSituations}
                onAdd={v => setBuyBox({ sellerSituations: [...buyBox.sellerSituations, v] })}
                onRemove={v => setBuyBox({ sellerSituations: buyBox.sellerSituations.filter(s => s !== v) })}
                placeholder="e.g. Retirement"
              />
            </FieldRow>
          </SettingsSection>

          <SettingsSection title="Financing Structure">
            <FieldRow label="Buyer Equity">
              <NumberInput value={buyBox.equityPercent} onChange={v => setBuyBox({ equityPercent: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="SBA Loan">
              <NumberInput value={buyBox.sbaPercent} onChange={v => setBuyBox({ sbaPercent: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Seller Note">
              <NumberInput value={buyBox.sellerNotePercent} onChange={v => setBuyBox({ sellerNotePercent: v })} suffix="%" />
            </FieldRow>
          </SettingsSection>

          <div className="flex items-center justify-between mt-4">
            <p className="text-[12px] text-text-tertiary">Changes are saved automatically.</p>
            <button
              onClick={resetBuyBox}
              className="text-[12px] text-text-tertiary hover:text-text-secondary px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-hover transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ── DEAL DEFAULTS ── */}
      {tab === 'deal-defaults' && (
        <div>
          <SettingsSection title="Default Deal Assumptions">
            <p className="text-[12px] text-text-tertiary mb-4">
              These values pre-fill the Deal tab on each company page. Override per-company as needed.
            </p>
            <FieldRow label="Owner Salary Replacement">
              <NumberInput value={dealInputs.ownerSalary} onChange={v => setDealInputs({ ownerSalary: v })} prefix="$" />
            </FieldRow>
            <FieldRow label="Revenue Growth Rate">
              <NumberInput value={dealInputs.growthRate} onChange={v => setDealInputs({ growthRate: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Buyer Equity (% of price)" sub="Down payment percentage">
              <NumberInput value={Math.round((dealInputs.buyerEquity / dealInputs.purchasePrice) * 100)} onChange={v => setDealInputs({ buyerEquity: dealInputs.purchasePrice * v / 100 })} suffix="%" />
            </FieldRow>
            <FieldRow label="SBA Interest Rate">
              <NumberInput value={dealInputs.interestRate} onChange={v => setDealInputs({ interestRate: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="SBA Loan Term">
              <NumberInput value={dealInputs.loanTerm} onChange={v => setDealInputs({ loanTerm: v })} suffix="yrs" />
            </FieldRow>
            <FieldRow label="Seller Note Rate">
              <NumberInput value={dealInputs.sellerNoteRate} onChange={v => setDealInputs({ sellerNoteRate: v })} suffix="%" />
            </FieldRow>
            <FieldRow label="Seller Note Term">
              <NumberInput value={dealInputs.sellerNoteTerm} onChange={v => setDealInputs({ sellerNoteTerm: v })} suffix="yrs" />
            </FieldRow>
          </SettingsSection>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-text-tertiary">Changes are saved automatically.</p>
            <button
              onClick={resetDealInputs}
              className="text-[12px] text-text-tertiary hover:text-text-secondary px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-hover transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* ── RESEARCH SOURCES ── */}
      {tab === 'research' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-text-secondary">
              {agents.filter(a => a.status !== 'Paused').length} of {agents.length} agents active
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-positive rounded-full animate-pulse" />
              <span className="text-[12px] text-text-tertiary">Running</span>
            </div>
          </div>
          <div className="space-y-3">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="mt-6 p-4 bg-bg-subtle rounded-lg border border-border-subtle">
            <p className="text-[12px] font-medium text-text-secondary mb-1">How agents work</p>
            <p className="text-[12px] text-text-tertiary leading-relaxed">
              Agents run on a schedule and surface companies matching your Buy Box. They research and score — they don't make contact. Results automatically appear in Discover.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
