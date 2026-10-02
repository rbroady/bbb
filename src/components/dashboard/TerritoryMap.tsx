'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3geo from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { formatCurrency } from '@/lib/formatting';

const TARGET_FIPS = new Set(['53', '41', '16', '06']); // WA OR ID CA
const STATE_LABELS: Record<string, { label: string; dx: number; dy: number }> = {
  '53': { label: 'WA', dx: 0,   dy: 0   },
  '41': { label: 'OR', dx: 0,   dy: 0   },
  '16': { label: 'ID', dx: 0,   dy: 0   },
  '06': { label: 'CA', dx: 0,   dy: -30 }, // nudge up — we clip southern CA
};

const STAGE_COLORS: Partial<Record<CompanyStatus, string>> = {
  saved:      '#52a94a',
  contacted:  '#5090c8',
  evaluating: '#d49540',
  loi:        '#d45050',
  diligence:  '#d45050',
  closed:     '#c8c8c8',
};

// Fixed viewBox — SVG scales to container via CSS, no JS resize needed
const VW = 400;
const VH = 460;

// Bounding box: 37°N–49.1°N, 124.8°W–111°W
const BOUNDS: [[number, number], [number, number]] = [[-124.8, 37.0], [-111.0, 49.1]];
const BOUND_FEATURE = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[
      [BOUNDS[0][0], BOUNDS[0][1]],
      [BOUNDS[1][0], BOUNDS[0][1]],
      [BOUNDS[1][0], BOUNDS[1][1]],
      [BOUNDS[0][0], BOUNDS[1][1]],
      [BOUNDS[0][0], BOUNDS[0][1]],
    ]],
  },
};

interface StatePath { fips: string; d: string; cx: number; cy: number }
interface Pin {
  id: string; x: number; y: number; r: number; haloR: number;
  color: string; isPipeline: boolean; company: Company;
}
interface Props { companies: Company[] }

export function TerritoryMap({ companies }: Props) {
  const router = useRouter();
  const [statePaths, setStatePaths] = useState<StatePath[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [tooltip, setTooltip] = useState<{ company: Company; x: number; y: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const topo: Topology = await fetch('/us-states.json').then(r => r.json());
      const statesGeo = topojson.feature(topo, topo.objects.states as TopoJSON.GeometryCollection);

      const proj = d3geo.geoMercator().fitSize([VW, VH], BOUND_FEATURE);
      const pathGen = d3geo.geoPath(proj);

      const paths: StatePath[] = [];
      for (const feat of statesGeo.features) {
        const fips = String(feat.id ?? '').padStart(2, '0');
        if (!TARGET_FIPS.has(fips)) continue;
        const d = pathGen(feat) ?? '';
        const [cx, cy] = pathGen.centroid(feat);
        const info = STATE_LABELS[fips];
        paths.push({ fips, d, cx: cx + (info?.dx ?? 0), cy: cy + (info?.dy ?? 0) });
      }
      setStatePaths(paths);

      const maxVal = Math.max(...companies.map(c => c.valuationEstimate), 1);
      const newPins: Pin[] = [];
      for (const c of companies) {
        if (c.lat == null || c.lng == null) continue;
        if (c.lng < BOUNDS[0][0] || c.lng > BOUNDS[1][0] || c.lat < BOUNDS[0][1] || c.lat > BOUNDS[1][1]) continue;
        const pt = proj([c.lng, c.lat]);
        if (!pt) continue;
        const isPipeline = PIPELINE_STATUSES.includes(c.status);
        const color = isPipeline ? (STAGE_COLORS[c.status] ?? '#c8c8c8') : '#3d3d3d';
        const r = isPipeline ? 4 + (c.valuationEstimate / maxVal) * 5 : 2.5;
        newPins.push({ id: c.id, x: pt[0], y: pt[1], r, haloR: r * 2.8, color, isPipeline, company: c });
      }
      setPins(newPins);
    };
    load();
  }, [companies]);

  const stageEntries = (Object.entries(STAGE_COLORS) as [CompanyStatus, string][])
    .filter(([s]) => companies.some(c => c.status === s));

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="relative flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full h-full"
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {statePaths.map(({ fips, d, cx, cy }) => (
            <g key={fips}>
              <path d={d} fill="#1e1e1e" stroke="#2e2e2e" strokeWidth={1} />
              <text
                x={cx} y={cy}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fill="#4d4d4d"
                fontFamily="Inter, system-ui, sans-serif" fontWeight={500}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {STATE_LABELS[fips]?.label}
              </text>
            </g>
          ))}

          {/* Non-pipeline dots */}
          {pins.filter(p => !p.isPipeline).map(p => (
            <circle
              key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.color}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/company/${p.id}`)}
              onMouseEnter={() => setTooltip({ company: p.company, x: p.x, y: p.y })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}

          {/* Pipeline halos + pins */}
          {pins.filter(p => p.isPipeline).map(p => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={p.haloR} fill={p.color} opacity={0.15} />
              <circle
                cx={p.x} cy={p.y} r={p.r} fill={p.color}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/company/${p.id}`)}
                onMouseEnter={() => setTooltip({ company: p.company, x: p.x, y: p.y })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip — positioned in pixel space relative to the rendered SVG */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${(tooltip.x / VW) * 100}%`,
              top: `${(tooltip.y / VH) * 100}%`,
              transform: tooltip.x > VW * 0.6 ? 'translate(-108%, -50%)' : 'translate(8px, -50%)',
            }}
          >
            <div className="bg-bg-canvas border border-border-default rounded-lg shadow-lg p-2.5 w-[176px]">
              <p className="text-[12px] font-semibold text-text-primary leading-tight mb-0.5">{tooltip.company.name}</p>
              <p className="text-[10px] text-text-tertiary mb-1.5">{tooltip.company.industry} · {tooltip.company.city}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] tabular-nums text-text-secondary">
                  {formatCurrency(tooltip.company.askingPrice ?? tooltip.company.valuationEstimate, true)}
                </span>
                <span className={`text-[13px] font-bold tabular-nums ${tooltip.company.boringBizScore >= 85 ? 'text-positive' : 'text-warning'}`}>
                  {tooltip.company.boringBizScore}
                </span>
              </div>
              <button
                className="pointer-events-auto mt-1.5 text-[10px] text-accent hover:underline"
                onMouseDown={() => router.push(`/company/${tooltip.company.id}`)}
              >
                View details →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        {stageEntries.map(([stage, color]) => (
          <div key={stage} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-text-tertiary capitalize">{stage}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-border-strong" />
          <span className="text-[10px] text-text-tertiary">Tracking</span>
        </div>
      </div>
    </div>
  );
}
