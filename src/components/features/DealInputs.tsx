'use client';
import { DealInputs as DealInputsType } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface FieldProps {
  label: string;
  value: number;
  field: keyof DealInputsType;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}

function Field({ label, value, field, prefix, suffix, step = 1, min = 0 }: FieldProps) {
  const setDealInputs = useAppStore(s => s.setDealInputs);

  return (
    <div>
      <label className="block text-[11px] text-text-secondary mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => setDealInputs({ [field]: parseFloat(e.target.value) || 0 })}
          className={`
            w-full h-10 md:h-8 text-[13px] tabular-nums bg-bg-canvas border border-border-default rounded-lg
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
            text-text-primary
            ${prefix ? 'pl-6' : 'pl-3'}
            ${suffix ? 'pr-8' : 'pr-3'}
          `}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-tertiary">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

export function DealInputsPanel() {
  const inputs = useAppStore(s => s.dealInputs);

  return (
    <div className="space-y-0">
      <Section title="Business">
        <Field label="Purchase Price" value={inputs.purchasePrice} field="purchasePrice" prefix="$" />
        <Field label="Revenue" value={inputs.revenue} field="revenue" prefix="$" />
        <Field label="EBITDA" value={inputs.ebitda} field="ebitda" prefix="$" />
        <Field label="SDE" value={inputs.sde} field="sde" prefix="$" />
        <Field label="Owner Salary" value={inputs.ownerSalary} field="ownerSalary" prefix="$" />
        <Field label="Add-backs" value={inputs.addBacks} field="addBacks" prefix="$" />
        <Field label="Growth Rate (annual)" value={inputs.growthRate} field="growthRate" suffix="%" step={0.5} />
        <Field label="EBITDA Margin" value={inputs.ebitdaMargin} field="ebitdaMargin" suffix="%" step={0.5} />
        <Field label="Gross Margin" value={inputs.grossMargin} field="grossMargin" suffix="%" step={0.5} />
        <Field label="Recurring Revenue" value={inputs.recurringRevenue} field="recurringRevenue" suffix="%" step={1} />
      </Section>

      <Section title="Financing">
        <Field label="Buyer Equity" value={inputs.buyerEquity} field="buyerEquity" prefix="$" />
        <Field label="SBA Loan" value={inputs.sbaLoan} field="sbaLoan" prefix="$" />
        <Field label="Interest Rate" value={inputs.interestRate} field="interestRate" suffix="%" step={0.1} />
        <Field label="Loan Term" value={inputs.loanTerm} field="loanTerm" suffix="yr" step={1} />
        <Field label="Seller Note" value={inputs.sellerNote} field="sellerNote" prefix="$" />
        <Field label="Seller Note Rate" value={inputs.sellerNoteRate} field="sellerNoteRate" suffix="%" step={0.5} />
        <Field label="Seller Note Term" value={inputs.sellerNoteTerm} field="sellerNoteTerm" suffix="yr" step={1} />
        <Field label="Earnout" value={inputs.earnout} field="earnout" prefix="$" />
      </Section>
    </div>
  );
}
