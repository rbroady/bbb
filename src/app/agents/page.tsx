'use client';
import { agents } from '@/data/agents';
import { AgentCard } from '@/components/features/AgentCard';
import { companies } from '@/data/companies';

const totalFound = agents.reduce((s, a) => s + a.businessesFound, 0);
const totalPrime = agents.reduce((s, a) => s + a.newPrime, 0);

export default function AgentsPage() {
  return (
    <div className="px-8 py-8 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-text-primary">Agents</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Automated research running in the background.</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 py-3 px-4 bg-bg-surface border border-border-subtle rounded-lg mb-6">
        {[
          { label: 'Total found', value: totalFound.toLocaleString() },
          { label: 'Prime targets', value: totalPrime },
          { label: 'In database', value: companies.length },
          { label: 'Active agents', value: agents.filter(a => a.status !== 'Paused').length },
        ].map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-3">
            {i > 0 && <div className="w-px h-6 bg-border-subtle" />}
            <div>
              <p className="text-[11px] text-text-tertiary">{label}</p>
              <p className="text-[18px] font-semibold tabular-nums text-text-primary leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-bg-subtle rounded-lg border border-border-subtle">
        <p className="text-[12px] font-medium text-text-secondary mb-1">How agents work</p>
        <p className="text-[12px] text-text-tertiary leading-relaxed">
          Agents run on a schedule and surface companies matching your Buy Box. They don&apos;t send emails or make contact — they research and score. You decide what&apos;s worth pursuing. Results automatically flow into Targets.
        </p>
      </div>
    </div>
  );
}
