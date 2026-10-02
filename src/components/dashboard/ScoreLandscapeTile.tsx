'use client';
import { useRouter } from 'next/navigation';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Company } from '@/types';

interface Props { companies: Company[] }

function scoreColor(score: number): string {
  if (score >= 85) return '#52a94a';
  if (score >= 70) return '#d49540';
  if (score >= 50) return '#5090c8';
  return '#3d3d3d';
}

export function ScoreLandscapeTile({ companies }: Props) {
  const router = useRouter();

  const data = companies.map(c => ({
    x: c.sophisticationScore,
    y: c.businessQualityScore,
    z: 60,
    id: c.id,
    name: c.name,
    score: c.boringBizScore,
    color: scoreColor(c.boringBizScore),
  }));

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
        {[
          { color: '#52a94a', label: '85+' },
          { color: '#d49540', label: '70–84' },
          { color: '#5090c8', label: '50–69' },
          { color: '#3d3d3d', label: '<50' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <span className="ml-auto text-[10px] text-text-disabled">sophistication →</span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: -24 }}>
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 35]}
              reversed
              tick={{ fill: '#4d4d4d', fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
              label={{ value: '', position: 'insideBottom' }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 42]}
              tick={{ fill: '#4d4d4d', fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis dataKey="z" range={[30, 30]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#2e2e2e' }}
              contentStyle={{
                background: '#111111',
                border: '1px solid #2e2e2e',
                borderRadius: 8,
                fontSize: 11,
                color: '#e8e8e8',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(_: unknown, __: unknown, props: any) => [
                `Score: ${props.payload?.score ?? ''}`,
                props.payload?.name ?? '',
              ]}
            />
            <Scatter
              data={data}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(d: any) => router.push(`/company/${d.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] text-text-disabled text-center -mt-1">quality ↑ · less sophisticated →</p>
    </div>
  );
}
