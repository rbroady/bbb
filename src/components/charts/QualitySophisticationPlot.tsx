'use client';
import { useRouter } from 'next/navigation';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Company } from '@/types';

interface Props {
  companies: Company[];
  mini?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Company }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-3 shadow-md text-[12px]">
      <p className="font-semibold text-text-primary">{c.name}</p>
      <p className="text-text-secondary">{c.city}, {c.state}</p>
      <p className="text-text-secondary mt-1">Score: <span className="text-text-primary font-medium tabular-nums">{c.boringBizScore}</span></p>
      <p className="text-text-secondary">Quality: {c.businessQualityScore}/40 · Sophistication: {c.sophisticationScore}</p>
    </div>
  );
}

function getColor(company: Company): string {
  if (company.boringBizScore >= 85) return '#536B38';
  if (company.boringBizScore >= 70) return '#9A6A28';
  if (company.boringBizScore >= 50) return '#8A8D84';
  return '#BBB9AF';
}

export function QualitySophisticationPlot({ companies, mini = false }: Props) {
  const router = useRouter();

  const data = companies.map(c => ({
    ...c,
    x: c.sophisticationScore,
    y: c.businessQualityScore,
  }));

  return (
    <div>
      {!mini && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-text-secondary">
              Quality × Sophistication
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Top-left quadrant = prime targets
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" />Prime (80+)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" />Strong (65–79)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-text-tertiary inline-block" />Other</span>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={mini ? 180 : 320}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: mini ? -10 : 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E1DFD7" />
          <XAxis
            type="number"
            dataKey="x"
            name="Sophistication"
            domain={[0, 35]}
            tick={{ fontSize: 10, fill: '#8A8D84' }}
            label={mini ? undefined : { value: 'Sophistication score (lower = less sophisticated)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#8A8D84' }}
            reversed
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Business Quality"
            domain={[0, 42]}
            tick={{ fontSize: 10, fill: '#8A8D84' }}
            label={mini ? undefined : { value: 'Business Quality', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8A8D84' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            data={data}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(d: any) => router.push(`/targets/${d.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={getColor(entry)} opacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
