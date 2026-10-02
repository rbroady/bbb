'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3geo from 'd3-geo';
import * as topojson from 'topojson-client';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { formatCurrency } from '@/lib/formatting';

// FIPS codes for our target states
const TARGET_FIPS = new Set(['53', '41', '16', '06']); // WA, OR, ID, CA
const STATE_LABELS: Record<string, string> = { '53': 'WA', '41': 'OR', '16': 'ID', '06': 'CA' };

const STAGE_COLORS: Partial<Record<CompanyStatus, string>> = {
  saved:      '#52a94a',
  contacted:  '#5090c8',
  evaluating: '#d49540',
  loi:        '#d45050',
  diligence:  '#d45050',
  closed:     '#c8c8c8',
};

interface Pin {
  company: Company;
  x: number;
  y: number;
  isPipeline: boolean;
  color: string;
  radius: number;
}

interface TooltipState {
  company: Company;
  x: number;
  y: number;
}

interface Props {
  companies: Company[];
}

// Bounding box: 37°N–49.1°N, 124.8°W–111°W
const BOUNDS: [[number, number], [number, number]] = [[-124.8, 37.0], [-111.0, 49.1]];

export function TerritoryMap({ companies }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<{ d: string; fips: string; label: string; cx: number; cy: number }[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const router = useRouter();

  // Observe container size
  useEffect(() => {
    if (!svgRef.current) return;
    const parent = svgRef.current.parentElement!;
    const obs = new ResizeObserver(e => {
      const { width, height } = e[0].contentRect;
      setSize({ w: width, h: height });
    });
    obs.observe(parent);
    setSize({ w: parent.clientWidth, h: parent.clientHeight });
    return () => obs.disconnect();
  }, []);

  // Load TopoJSON and compute paths + pins
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;

    const run = async () => {
      // dynamic import avoids bundling the large JSON at build time
      const atlas = await import('us-atlas/states-110m.json');
      const topo = atlas.default as unknown as TopoJSON.Topology;
      const statesGeo = topojson.feature(topo, topo.objects.states as TopoJSON.GeometryCollection);

      const projection = d3geo.geoMercator().fitExtent(
        [[8, 8], [size.w - 8, size.h - 24]],
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [BOUNDS[0][0], BOUNDS[0][1]],
              [BOUNDS[1][0], BOUNDS[0][1]],
              [BOUNDS[1][0], BOUNDS[1][1]],
              [BOUNDS[0][0], BOUNDS[1][1]],
              [BOUNDS[0][0], BOUNDS[0][1]],
            ]],
          },
        }
      );
      const pathGen = d3geo.geoPath(projection);

      const computed: typeof paths = [];
      for (const feat of statesGeo.features) {
        const fips = String(feat.id).padStart(2, '0');
        if (!TARGET_FIPS.has(fips)) continue;
        const d = pathGen(feat) ?? '';
        const centroid = pathGen.centroid(feat);
        let [cx, cy] = centroid;
        // Nudge CA label up because we're cropping southern CA
        if (fips === '06') cy = Math.min(cy, size.h - 32);
        computed.push({ d, fips, label: STATE_LABELS[fips] ?? '', cx, cy });
      }
      setPaths(computed);

      // Compute pins
      const maxVal = Math.max(...companies.filter(c => c.valuationEstimate).map(c => c.valuationEstimate));
      const computed2: Pin[] = [];
      for (const c of companies) {
        if (c.lat == null || c.lng == null) continue;
        // Clip to our visible bounding box
        if (c.lng < BOUNDS[0][0] || c.lng > BOUNDS[1][0] || c.lat < BOUNDS[0][1] || c.lat > BOUNDS[1][1]) continue;
        const pt = projection([c.lng, c.lat]);
        if (!pt) continue;
        const isPipeline = PIPELINE_STATUSES.includes(c.status);
        const color = isPipeline ? (STAGE_COLORS[c.status] ?? '#c8c8c8') : '#3d3d3d';
        const radius = isPipeline ? 4 + (c.valuationEstimate / maxVal) * 6 : 3;
        computed2.push({ company: c, x: pt[0], y: pt[1], isPipeline, color, radius });
      }
      setPins(computed2);
    };
    run();
  }, [size.w, size.h, companies]);

  const pipelineCount = companies.filter(c => PIPELINE_STATUSES.includes(c.status)).length;
  const stageEntries = Object.entries(STAGE_COLORS).filter(([s]) =>
    companies.some(c => c.status === s)
  ) as [CompanyStatus, string][];

  return (
    <div className="relative w-full h-full flex flex-col min-h-0">
      {/* Map */}
      <div className="relative flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }}>
          {/* States */}
          {paths.map(p => (
            <g key={p.fips}>
              <path
                d={p.d}
                fill="#1a1a1a"
                stroke="#2e2e2e"
                strokeWidth={1}
              />
              <text
                x={p.cx}
                y={p.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fill="#4d4d4d"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={500}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Non-pipeline dots */}
          {pins.filter(p => !p.isPipeline).map(p => (
            <circle
              key={p.company.id}
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill={p.color}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/company/${p.company.id}`)}
              onMouseEnter={() => setTooltip({ company: p.company, x: p.x, y: p.y })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}

          {/* Pipeline halos + pins */}
          {pins.filter(p => p.isPipeline).map(p => (
            <g key={p.company.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.radius * 2.8}
                fill={p.color}
                opacity={0.12}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={p.radius}
                fill={p.color}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/company/${p.company.id}`)}
                onMouseEnter={() => setTooltip({ company: p.company, x: p.x, y: p.y })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              transform: tooltip.x > size.w * 0.6 ? 'translateX(-110%)' : undefined,
            }}
          >
            <div className="bg-bg-canvas border border-border-default rounded-lg shadow-lg p-2.5 w-[180px]">
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
      <div className="flex items-center gap-3 flex-wrap pt-2 pb-0.5">
        {stageEntries.map(([stage, color]) => (
          <div key={stage} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-text-tertiary capitalize">{stage}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-bg-active" />
          <span className="text-[10px] text-text-tertiary">Tracking</span>
        </div>
      </div>
    </div>
  );
}
