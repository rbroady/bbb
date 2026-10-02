'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Map, TrendingUp, GitMerge, Crosshair, Bookmark, Radio } from 'lucide-react';
import { useAllCompanies } from '@/lib/useAllCompanies';
import { useAppStore } from '@/store/useAppStore';
import { Company, CompanyStatus, PIPELINE_STATUSES } from '@/types';
import { DealFlowTile } from '@/components/dashboard/DealFlowTile';
import { PipelineFunnelTile } from '@/components/dashboard/PipelineFunnelTile';
import { ScoreLandscapeTile } from '@/components/dashboard/ScoreLandscapeTile';
import { TopOpportunitiesTile } from '@/components/dashboard/TopOpportunitiesTile';
import { AgentActivityTile } from '@/components/dashboard/AgentActivityTile';

// Map renders SVG via d3 — SSR off
const TerritoryMap = dynamic(
  () => import('@/components/dashboard/TerritoryMap').then(m => m.TerritoryMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-bg-subtle rounded animate-pulse" /> }
);

interface TileProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

function Tile({ icon, label, href, children, className = '' }: TileProps) {
  const router = useRouter();
  return (
    <div
      className={`bg-bg-surface border border-border-subtle rounded-[10px] p-4 flex flex-col gap-3 ${className} ${href ? 'cursor-pointer hover:border-border-default transition-colors' : ''}`}
      onClick={href ? () => router.push(href) : undefined}
    >
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-text-tertiary">{icon}</span>
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

const CHIP_BASE = 'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors cursor-pointer hover:border-border-default';

export default function DashboardPage() {
  const allCompanies = useAllCompanies();
  const { companyStatuses, lastVisitAt, recordVisit } = useAppStore();

  const getStatus = (c: Company): CompanyStatus =>
    (companyStatuses[c.id] as CompanyStatus) ?? c.status;

  // Record visit after a short delay so we can show the strip first
  useEffect(() => {
    const t = setTimeout(recordVisit, 2000);
    return () => clearTimeout(t);
  }, []);

  const pipelineCount = useMemo(
    () => allCompanies.filter(c => PIPELINE_STATUSES.includes(getStatus(c))).length,
    [allCompanies, companyStatuses]
  );
  const newCount = useMemo(
    () => allCompanies.filter(c => getStatus(c) === 'new').length,
    [allCompanies, companyStatuses]
  );

  // "Since last visit" strip — compute new businesses discovered after lastVisitAt
  const sinceLastVisit = useMemo(() => {
    if (!lastVisitAt) return null;
    const since = new Date(lastVisitAt);
    const newMatches = allCompanies.filter(c => {
      if (!c.discoveredAt) return false;
      return new Date(c.discoveredAt) > since && getStatus(c) === 'new';
    }).length;
    const stale = allCompanies.filter(c => {
      if (!PIPELINE_STATUSES.includes(getStatus(c))) return false;
      if (!c.lastResearched) return false;
      const days = (Date.now() - new Date(c.lastResearched).getTime()) / 86400000;
      return days > 14;
    }).length;
    return { newMatches, stale };
  }, [allCompanies, companyStatuses, lastVisitAt]);

  const router = useRouter();

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-serif text-[22px] font-normal text-text-primary">Dashboard</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">
          {allCompanies.length} businesses tracked · {pipelineCount} in pipeline
        </p>
      </div>

      {/* Since last visit strip */}
      {sinceLastVisit && (sinceLastVisit.newMatches > 0 || sinceLastVisit.stale > 0) && (
        <div className="flex gap-2 flex-wrap mb-5">
          {sinceLastVisit.newMatches > 0 && (
            <button
              onClick={() => router.push('/')}
              className={`${CHIP_BASE} bg-bg-subtle border-border-subtle text-text-secondary`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              {sinceLastVisit.newMatches} new {sinceLastVisit.newMatches === 1 ? 'match' : 'matches'}
            </button>
          )}
          {sinceLastVisit.stale > 0 && (
            <button
              onClick={() => router.push('/pipeline')}
              className={`${CHIP_BASE} bg-bg-subtle border-border-subtle text-text-secondary`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {sinceLastVisit.stale} {sinceLastVisit.stale === 1 ? 'deal' : 'deals'} going stale
            </button>
          )}
        </div>
      )}

      {/* 3 × 2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Tile 1: Territory map — tall, spans 1 col but taller */}
        <Tile icon={<Map size={12} />} label="Territory" className="row-span-2 min-h-[360px] lg:min-h-0">
          <TerritoryMap companies={allCompanies} />
        </Tile>

        {/* Tile 2: Deal flow */}
        <Tile icon={<TrendingUp size={12} />} label="Deal flow" className="min-h-[200px]">
          <DealFlowTile companies={allCompanies} />
        </Tile>

        {/* Tile 3: Pipeline funnel */}
        <Tile icon={<GitMerge size={12} />} label="Pipeline" href="/pipeline" className="min-h-[200px]">
          <PipelineFunnelTile companies={allCompanies} getStatus={getStatus} />
        </Tile>

        {/* Tile 4: Score landscape */}
        <Tile icon={<Crosshair size={12} />} label="Score landscape" className="min-h-[200px]">
          <ScoreLandscapeTile companies={allCompanies} />
        </Tile>

        {/* Tile 5: Top opportunities */}
        <Tile icon={<Bookmark size={12} />} label={`Top opportunities · ${newCount} new`} href="/" className="min-h-[200px]">
          <TopOpportunitiesTile companies={allCompanies} getStatus={getStatus} />
        </Tile>

        {/* Tile 6: Research agents */}
        <Tile icon={<Radio size={12} />} label="Research agents" className="min-h-[200px]">
          <AgentActivityTile />
        </Tile>
      </div>
    </div>
  );
}
