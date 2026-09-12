'use client';
import { DealResults as DealResultsType } from '@/types';
import { CapitalStackBar } from '@/components/charts/CapitalStackBar';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { formatCurrency, formatMultiple, formatPercent } from '@/lib/formatting';
import { DealInputs } from '@/types';

interface MetricProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warning?: boolean;
  good?: boolean;
}

function Metric({ label, value, sub, highlight, warning, good }: MetricProps) {
  const valueColor = highlight
    ? good ? 'text-positive' : warning ? 'text-warning' : 'text-accent'
    : 'text-text-primary';

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-3">
      <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-[20px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="text-[11px] text-text-tertiary mt-1">{sub}</p>}
    </div>
  );
}

interface Props {
  results: DealResultsType;
  inputs: DealInputs;
}

export function DealResultsPanel({ results, inputs }: Props) {
  const dscrGood = results.dscr >= 1.25;
  const dscrOk = results.dscr >= 1.0;
  const coc = results.cashOnCash * 100;

  const segments = [
    { label: 'Equity', value: inputs.buyerEquity, color: '#536B38', textColor: '#FAF9F4' },
    { label: 'SBA Loan', value: inputs.sbaLoan, color: '#526873', textColor: '#FAF9F4' },
    { label: 'Seller Note', value: inputs.sellerNote, color: '#9A6A28', textColor: '#FAF9F4' },
    ...(inputs.earnout > 0 ? [{ label: 'Earnout', value: inputs.earnout, color: '#BBB9AF', textColor: '#20231E' }] : []),
  ].filter(s => s.value > 0);

  return (
    <div>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Metric
          label="DSCR"
          value={results.dscr.toFixed(2)}
          sub={dscrGood ? 'SBA bankable' : dscrOk ? 'Marginally bankable' : 'Below SBA threshold'}
          highlight
          good={dscrGood}
          warning={!dscrOk}
        />
        <Metric
          label="Year-1 Cash Flow"
          value={formatCurrency(results.yearOneCashFlow, true)}
          sub="After debt service & salary"
          highlight
          good={results.yearOneCashFlow > 0}
          warning={results.yearOneCashFlow < 0}
        />
        <Metric
          label="Cash-on-Cash Return"
          value={formatPercent(coc)}
          sub="Year 1"
          highlight
          good={coc >= 15}
        />
        <Metric
          label="Equity Invested"
          value={formatCurrency(inputs.buyerEquity, true)}
          sub={`${((inputs.buyerEquity / inputs.purchasePrice) * 100).toFixed(0)}% of purchase price`}
        />
        <Metric
          label="EBITDA Multiple"
          value={formatMultiple(results.ebitdaMultiple)}
        />
        <Metric
          label="SDE Multiple"
          value={formatMultiple(results.sdeMultiple)}
        />
        <Metric
          label="5-Yr IRR"
          value={formatPercent(results.irr * 100)}
          sub="Estimated"
          highlight
          good={results.irr > 0.2}
        />
        <Metric
          label="Annual Debt Service"
          value={formatCurrency(results.annualDebtService, true)}
          sub="SBA + seller note"
        />
      </div>

      {/* Capital Stack */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Capital Stack</p>
        <CapitalStackBar segments={segments} total={inputs.purchasePrice} />
      </div>

      {/* 5-Year Projection */}
      <div>
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">5-Year Cash Flow</p>
        <CashFlowChart data={results.fiveYearProjection} />
      </div>

      {/* Sensitivity table */}
      <div className="mt-5">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">DSCR Sensitivity</p>
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-bg-subtle">
                <th className="text-left px-3 py-2 text-text-secondary font-semibold">Revenue</th>
                <th className="text-right px-3 py-2 text-text-secondary font-semibold">−20%</th>
                <th className="text-right px-3 py-2 text-text-secondary font-semibold">Base</th>
                <th className="text-right px-3 py-2 text-text-secondary font-semibold">+20%</th>
              </tr>
            </thead>
            <tbody>
              {[-0.1, 0, 0.1].map((marginAdj, i) => {
                const label = marginAdj < 0 ? 'Margin −10%' : marginAdj > 0 ? 'Margin +10%' : 'Base margin';
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-canvas'}>
                    <td className="px-3 py-2 text-text-secondary">{label}</td>
                    {[-0.2, 0, 0.2].map((revAdj, j) => {
                      const adjSDE = inputs.sde * (1 + revAdj) * (1 + marginAdj);
                      const adjCF = adjSDE - inputs.ownerSalary;
                      const dscr = results.annualDebtService > 0 ? adjCF / results.annualDebtService : 0;
                      const color = dscr >= 1.25 ? 'text-positive' : dscr >= 1.0 ? 'text-warning' : 'text-negative';
                      return (
                        <td key={j} className={`px-3 py-2 text-right tabular-nums font-medium ${color}`}>
                          {dscr.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
