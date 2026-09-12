'use client';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

const allIndustries = [
  'HVAC', 'Plumbing', 'Pest Control', 'Septic Service', 'Locksmith', 'Pool Service',
  'Irrigation', 'Roofing', 'Electrical', 'Commercial Cleaning', 'Restoration',
  'Equipment Services', 'Tree Service', 'Auto Repair', 'Landscaping', 'Painting',
  'Moving', 'Handyman', 'Drywall', 'Residential Cleaning',
];

const allStates = ['OR', 'WA', 'ID', 'CA', 'NV', 'AZ', 'CO', 'UT', 'MT', 'WY'];

const sellerSituationOptions = [
  'Retirement', 'Health', 'Relocation', 'Burnout', 'No successor', 'Divorce', 'Partnership dissolution',
];

function NumberField({
  label, value, field, prefix, suffix, step = 1000, min = 0,
}: {
  label: string; value: number; field: string; prefix?: string; suffix?: string; step?: number; min?: number;
}) {
  const setBuyBox = useAppStore(s => s.setBuyBox);
  return (
    <div>
      <label className="block text-[11px] text-text-secondary mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => setBuyBox({ [field]: parseFloat(e.target.value) || 0 })}
          className={`w-full h-10 md:h-8 text-[13px] tabular-nums bg-bg-canvas border border-border-default rounded-lg focus:outline-none focus:border-accent text-text-primary ${prefix ? 'pl-6' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">{suffix}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5 mb-4">
      <h3 className="text-[13px] font-semibold text-text-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function BuyBoxEditor() {
  const { buyBox, setBuyBox, resetBuyBox } = useAppStore();

  const toggleIndustry = (industry: string, list: 'targetIndustries' | 'maybeIndustries' | 'avoidIndustries') => {
    const current = buyBox[list];
    const othersTarget = list !== 'targetIndustries' ? buyBox.targetIndustries.filter(i => i !== industry) : buyBox.targetIndustries;
    const othersMaybe = list !== 'maybeIndustries' ? buyBox.maybeIndustries.filter(i => i !== industry) : buyBox.maybeIndustries;
    const othersAvoid = list !== 'avoidIndustries' ? buyBox.avoidIndustries.filter(i => i !== industry) : buyBox.avoidIndustries;

    if (current.includes(industry)) {
      setBuyBox({ [list]: current.filter(i => i !== industry) });
    } else {
      setBuyBox({
        targetIndustries: othersTarget,
        maybeIndustries: othersMaybe,
        avoidIndustries: othersAvoid,
        [list]: [...current, industry],
      });
    }
  };

  const toggleState = (state: string) => {
    const current = buyBox.targetStates;
    setBuyBox({ targetStates: current.includes(state) ? current.filter(s => s !== state) : [...current, state] });
  };

  const toggleSituation = (sit: string) => {
    const current = buyBox.sellerSituations;
    setBuyBox({ sellerSituations: current.includes(sit) ? current.filter(s => s !== sit) : [...current, sit] });
  };

  const totalPct = buyBox.equityPercent + buyBox.sbaPercent + buyBox.sellerNotePercent + buyBox.earnoutPercent;

  return (
    <div>
      {/* Deal Size */}
      <Section title="Deal Size">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField label="Min Purchase Price" value={buyBox.minPrice} field="minPrice" prefix="$" />
          <NumberField label="Max Purchase Price" value={buyBox.maxPrice} field="maxPrice" prefix="$" />
          <NumberField label="Min Revenue" value={buyBox.minRevenue} field="minRevenue" prefix="$" />
          <NumberField label="Max Revenue" value={buyBox.maxRevenue} field="maxRevenue" prefix="$" />
          <NumberField label="Min EBITDA" value={buyBox.minEbitda} field="minEbitda" prefix="$" />
          <NumberField label="Max EBITDA" value={buyBox.maxEbitda} field="maxEbitda" prefix="$" />
          <NumberField label="Target Multiple" value={buyBox.targetMultiple} field="targetMultiple" step={0.5} min={1} />
        </div>
      </Section>

      {/* Financial Quality */}
      <Section title="Financial Quality">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField label="Min EBITDA Margin" value={buyBox.minMargin} field="minMargin" suffix="%" step={1} />
          <NumberField label="Min Free Cash Flow" value={buyBox.minFCF} field="minFCF" prefix="$" step={10000} />
          <NumberField label="Max Customer Concentration" value={buyBox.maxCustomerConcentration} field="maxCustomerConcentration" suffix="%" step={5} />
          <NumberField label="Min Recurring Revenue" value={buyBox.minRecurringRevenue} field="minRecurringRevenue" suffix="%" step={5} />
        </div>
      </Section>

      {/* Industries */}
      <Section title="Industries">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['Target', 'Maybe', 'Avoid'].map(col => (
            <p key={col} className={`text-[11px] font-semibold uppercase tracking-wider ${
              col === 'Target' ? 'text-accent' : col === 'Maybe' ? 'text-warning' : 'text-negative'
            }`}>{col}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allIndustries.map(industry => {
            const isTarget = buyBox.targetIndustries.includes(industry);
            const isMaybe = buyBox.maybeIndustries.includes(industry);
            const isAvoid = buyBox.avoidIndustries.includes(industry);
            let style = 'bg-bg-subtle text-text-secondary border-border-subtle';
            if (isTarget) style = 'bg-accent-soft text-accent-ink border-accent/30';
            else if (isMaybe) style = 'bg-warning-soft text-warning border-warning/30';
            else if (isAvoid) style = 'bg-negative-soft text-negative border-negative/30';

            return (
              <button
                key={industry}
                onClick={() => {
                  if (isTarget) toggleIndustry(industry, 'maybeIndustries');
                  else if (isMaybe) toggleIndustry(industry, 'avoidIndustries');
                  else if (isAvoid) {
                    setBuyBox({
                      avoidIndustries: buyBox.avoidIndustries.filter(i => i !== industry),
                    });
                  } else toggleIndustry(industry, 'targetIndustries');
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${style}`}
              >
                {industry}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-text-tertiary mt-2">Click to cycle: None → Target → Maybe → Avoid</p>
      </Section>

      {/* Geography */}
      <Section title="Geography">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {allStates.map(state => (
            <button
              key={state}
              onClick={() => toggleState(state)}
              className={`text-[12px] px-3 py-1 rounded-md border font-medium transition-colors ${
                buyBox.targetStates.includes(state)
                  ? 'bg-accent text-text-inverse border-accent'
                  : 'bg-bg-subtle text-text-secondary border-border-subtle hover:border-border-default'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-[11px] text-text-secondary mb-1">Metro areas (comma separated)</label>
          <input
            type="text"
            value={buyBox.targetMetros.join(', ')}
            onChange={(e) => setBuyBox({ targetMetros: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            className="w-full h-8 text-[13px] bg-bg-canvas border border-border-default rounded-lg px-3 focus:outline-none focus:border-accent text-text-primary"
          />
        </div>
      </Section>

      {/* Seller Situations */}
      <Section title="Seller Situation">
        <div className="flex flex-wrap gap-1.5">
          {sellerSituationOptions.map(sit => (
            <button
              key={sit}
              onClick={() => toggleSituation(sit)}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                buyBox.sellerSituations.includes(sit)
                  ? 'bg-accent-soft text-accent-ink border-accent/30'
                  : 'bg-bg-subtle text-text-secondary border-border-subtle hover:border-border-default'
              }`}
            >
              {sit}
            </button>
          ))}
        </div>
      </Section>

      {/* Capital Strategy */}
      <Section title="Capital Strategy">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Equity %', field: 'equityPercent', color: '#536B38' },
            { label: 'SBA %', field: 'sbaPercent', color: '#526873' },
            { label: 'Seller Note %', field: 'sellerNotePercent', color: '#9A6A28' },
            { label: 'Earnout %', field: 'earnoutPercent', color: '#BBB9AF' },
          ].map(({ label, field, color }) => (
            <div key={field}>
              <label className="block text-[11px] text-text-secondary mb-1">{label}</label>
              <div className="relative">
                <input
                  type="number"
                  value={(buyBox as unknown as Record<string, number>)[field]}
                  step={5}
                  min={0}
                  max={100}
                  onChange={(e) => setBuyBox({ [field]: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 text-[13px] tabular-nums bg-bg-canvas border border-border-default rounded-lg px-3 pr-8 focus:outline-none focus:border-accent text-text-primary"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">%</span>
              </div>
              <div className="h-1.5 rounded-full mt-1.5" style={{ backgroundColor: color, opacity: 0.3 + ((buyBox as unknown as Record<string, number>)[field] / 100) * 0.7 }} />
            </div>
          ))}
        </div>
        {/* Visual proportional bar */}
        <div className="flex w-full h-4 rounded-lg overflow-hidden mb-1">
          {[
            { pct: buyBox.equityPercent, color: '#536B38', label: 'Equity' },
            { pct: buyBox.sbaPercent, color: '#526873', label: 'SBA' },
            { pct: buyBox.sellerNotePercent, color: '#9A6A28', label: 'Seller Note' },
            { pct: buyBox.earnoutPercent, color: '#BBB9AF', label: 'Earnout' },
          ].filter(s => s.pct > 0).map(s => (
            <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} title={`${s.label}: ${s.pct}%`} />
          ))}
        </div>
        {totalPct !== 100 && (
          <p className="text-[11px] text-warning mt-1">Total is {totalPct}% — should equal 100%</p>
        )}
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <textarea
          value={buyBox.notes}
          onChange={(e) => setBuyBox({ notes: e.target.value })}
          rows={4}
          placeholder="Additional acquisition thesis notes..."
          className="w-full text-[13px] bg-bg-canvas border border-border-default rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent text-text-primary resize-none"
        />
      </Section>

      <div className="flex gap-3">
        <Button variant="primary" size="md" onClick={() => {/* already persisted via zustand */}}>
          Save Buy Box
        </Button>
        <Button variant="ghost" size="md" onClick={resetBuyBox}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
