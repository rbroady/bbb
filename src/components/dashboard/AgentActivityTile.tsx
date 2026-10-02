'use client';
import { useRouter } from 'next/navigation';
import { agents } from '@/data/agents';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-positive',
  Running: 'bg-info animate-pulse',
  Paused: 'bg-bg-active',
};

export function AgentActivityTile() {
  const router = useRouter();
  const totalFound = agents.reduce((s, a) => s + a.businessesFound, 0);
  const totalPrime = agents.reduce((s, a) => s + a.newPrime, 0);
  const activeCount = agents.filter(a => a.status !== 'Paused').length;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-baseline gap-3">
        <div>
          <span className="text-[32px] font-bold tabular-nums text-text-primary leading-none">{totalFound.toLocaleString()}</span>
          <span className="text-[12px] text-text-tertiary ml-1.5">scanned</span>
        </div>
        <div className="ml-auto text-right">
          <span className="text-[18px] font-bold tabular-nums text-positive leading-none">{totalPrime}</span>
          <span className="text-[11px] text-text-tertiary ml-1">prime</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="flex items-center gap-2 py-1 cursor-pointer group"
            onClick={() => router.push('/settings?tab=research')}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[agent.status]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-text-secondary truncate group-hover:text-text-primary transition-colors">
                {agent.name}
              </p>
              {agent.recentFinding && (
                <p className="text-[10px] text-text-tertiary truncate">↳ {agent.recentFinding}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-[11px] tabular-nums text-text-tertiary">{agent.businessesFound.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border-subtle">
        <span className="w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0" />
        <span className="text-[10px] text-text-tertiary">{activeCount} of {agents.length} active</span>
        <button
          onClick={() => router.push('/settings')}
          className="ml-auto text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Manage →
        </button>
      </div>
    </div>
  );
}
