'use client';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Company } from '@/types';

type Period = 'week' | 'month' | 'year';

function getBuckets(companies: Company[], period: Period) {
  const now = new Date('2026-10-02');

  if (period === 'week') {
    // Last 7 days, grouped by day (Tue–Mon, etc.)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d.toDateString(), count: 0 };
    });
    companies.forEach(c => {
      if (!c.discoveredAt) return;
      const d = new Date(c.discoveredAt);
      days.forEach(b => { if (b.date === d.toDateString()) b.count++; });
    });
    return days;
  }

  if (period === 'month') {
    // Last 8 weeks
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(now);
      start.setDate(start.getDate() - (7 - i) * 7);
      return { label: `W${i + 1}`, start: new Date(start), count: 0 };
    });
    companies.forEach(c => {
      if (!c.discoveredAt) return;
      const d = new Date(c.discoveredAt);
      weeks.forEach((b, i) => {
        const nextStart = i < weeks.length - 1 ? weeks[i + 1].start : new Date(now.getTime() + 86400000);
        if (d >= b.start && d < nextStart) b.count++;
      });
    });
    return weeks.map(({ label, count }) => ({ label, count }));
  }

  // year: last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      count: 0,
    };
  });
  companies.forEach(c => {
    if (!c.discoveredAt) return;
    const d = new Date(c.discoveredAt);
    months.forEach(b => {
      if (d.getMonth() === b.month && d.getFullYear() === b.year) b.count++;
    });
  });
  return months.map(({ label, count }) => ({ label, count }));
}

interface Props { companies: Company[] }

export function DealFlowTile({ companies }: Props) {
  const [period, setPeriod] = useState<Period>('month');

  const current = useMemo(() => getBuckets(companies, period), [companies, period]);
  const total = current.reduce((s, b) => s + b.count, 0);

  // Prior period for delta
  const prior = useMemo(() => {
    const shifted = companies.map(c => {
      if (!c.discoveredAt) return c;
      const d = new Date(c.discoveredAt);
      if (period === 'week') d.setDate(d.getDate() - 7);
      else if (period === 'month') d.setDate(d.getDate() - 56);
      else d.setMonth(d.getMonth() - 6);
      return { ...c, discoveredAt: d.toISOString().slice(0, 10) };
    });
    return getBuckets(shifted, period).reduce((s, b) => s + b.count, 0);
  }, [companies, period]);

  const delta = total - prior;
  const lastIdx = current.length - 1;

  const periodLabels: Record<Period, string> = { week: 'Wk', month: 'Mo', year: 'Yr' };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-bold tabular-nums text-text-primary leading-none">{total}</span>
          {delta !== 0 && (
            <span className={`text-[13px] font-medium tabular-nums ${delta > 0 ? 'text-positive' : 'text-negative'}`}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>
        <div className="flex gap-0.5 bg-bg-subtle rounded-md p-0.5">
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                period === p ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={current} barSize={period === 'week' ? 20 : 14} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#4d4d4d', fontSize: 10, fontFamily: 'Inter, system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#4d4d4d', fontSize: 10, fontFamily: 'Inter, system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#1e1e1e' }}
              contentStyle={{
                background: '#111111',
                border: '1px solid #2e2e2e',
                borderRadius: 8,
                fontSize: 11,
                color: '#e8e8e8',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
              formatter={(v: unknown) => [v as number, 'New businesses']}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {current.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === lastIdx ? '#7a7a7a' : '#2e2e2e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
