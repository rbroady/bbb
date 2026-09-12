'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { YearProjection } from '@/types';
import { formatCurrency } from '@/lib/formatting';

interface Props {
  data: YearProjection[];
}

export function CashFlowChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1DFD7" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#8A8D84' }}
          tickFormatter={(v) => `Yr ${v}`}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#8A8D84' }}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={55}
        />
        <Tooltip
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
          labelFormatter={(label) => `Year ${label}`}
          contentStyle={{
            background: '#FCFBF7',
            border: '1px solid #D5D3C9',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="cashFlow"
          name="Cash Flow"
          stroke="#536B38"
          strokeWidth={2}
          dot={{ fill: '#536B38', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="ebitda"
          name="EBITDA"
          stroke="#9A6A28"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
