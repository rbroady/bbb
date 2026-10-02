'use client';
import { notFound, useParams } from 'next/navigation';
import { agents } from '@/data/agents';

const STATUS_STYLES: Record<string, string> = {
  Active:  'bg-positive-soft text-positive',
  Running: 'bg-info-soft text-info',
  Paused:  'bg-bg-subtle text-text-tertiary border border-border-subtle',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const agent = agents.find(a => a.id === id);
  if (!agent) notFound();

  const nextRunDisplay = agent.nextRun === 'Paused' ? 'Paused' :
    agent.nextRun ? relativeTime(agent.nextRun) : '—';

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[800px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-serif text-[22px] font-normal text-text-primary">{agent.name}</h1>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${STATUS_STYLES[agent.status] ?? 'bg-bg-subtle text-text-secondary'}`}>
            {agent.status}
          </span>
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed">{agent.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Businesses found', value: agent.businessesFound.toLocaleString() },
          { label: 'Prime targets', value: agent.newPrime },
          { label: 'Last run', value: agent.lastRun ? relativeTime(agent.lastRun) : '—' },
          { label: 'Next run', value: nextRunDisplay },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-surface border border-border-subtle rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold mb-1">{label}</p>
            <p className="text-[18px] font-semibold text-text-primary tabular-nums leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent finding */}
      {agent.recentFinding && (
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold mb-1.5">Most recent finding</p>
          <p className="text-[14px] font-medium text-text-primary">{agent.recentFinding}</p>
        </div>
      )}

      {/* Activity log */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle">
          <p className="text-[11px] uppercase tracking-widest text-text-tertiary font-semibold">Live activity</p>
        </div>
        <div className="p-4 space-y-2 font-mono">
          {agent.activityText.map((line, i) => (
            <p key={i} className={`text-[12px] ${line.startsWith('✓') ? 'text-positive' : line.startsWith('•') ? 'text-text-secondary' : 'text-text-tertiary'}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
