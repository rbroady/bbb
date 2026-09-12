'use client';
import { useState } from 'react';
import { Agent } from '@/types';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { formatRelativeDate } from '@/lib/formatting';
import { Play, Settings, Pause } from 'lucide-react';

interface Props {
  agent: Agent;
}

export function AgentCard({ agent }: Props) {
  const [status, setStatus] = useState(agent.status);
  const [activityIdx, setActivityIdx] = useState(0);
  const [running, setRunning] = useState(agent.status === 'Running');

  const handleRunNow = () => {
    setRunning(true);
    setStatus('Running');
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setActivityIdx(idx);
      if (idx >= agent.activityText.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setRunning(false);
          setStatus('Active');
          setActivityIdx(0);
        }, 2000);
      }
    }, 1200);
  };

  const handleToggle = () => {
    setStatus(s => s === 'Paused' ? 'Active' : 'Paused');
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">{agent.name}</h3>
          <p className="text-[12px] text-text-secondary mt-1 leading-relaxed max-w-md">{agent.description}</p>
        </div>
        <StatusChip status={status} size="sm" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border-subtle">
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Found</p>
          <p className="text-[15px] font-semibold tabular-nums text-text-primary">{agent.businessesFound.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Prime</p>
          <p className="text-[15px] font-semibold tabular-nums text-accent">{agent.newPrime}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Recent finding</p>
          <p className="text-[13px] font-medium text-text-primary">{agent.recentFinding}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Last run</p>
          <p className="text-[12px] text-text-secondary">{formatRelativeDate(agent.lastRun)}</p>
          {status !== 'Paused' && (
            <>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">Next run</p>
              <p className="text-[12px] text-text-secondary">{agent.nextRun === 'Paused' ? '—' : 'Tomorrow 6am'}</p>
            </>
          )}
        </div>
      </div>

      {/* Activity */}
      {running && (
        <div className="mb-4 p-3 bg-bg-subtle rounded-lg">
          <p className="text-[11px] font-medium text-text-secondary mb-1.5">Running…</p>
          {agent.activityText.slice(0, activityIdx + 1).map((line, i) => (
            <p
              key={i}
              className={`text-[11px] font-mono leading-relaxed ${
                i === activityIdx ? 'text-text-primary' : 'text-text-tertiary'
              }`}
            >
              {line}
            </p>
          ))}
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={handleToggle}>
          {status === 'Paused' ? <Play size={12} /> : <Pause size={12} />}
          {status === 'Paused' ? 'Resume' : 'Pause'}
        </Button>
        <Button size="sm" variant="secondary" onClick={handleRunNow} loading={running}>
          <Play size={12} />
          Run now
        </Button>
        <Button size="sm" variant="ghost">
          <Settings size={12} />
          Configure
        </Button>
      </div>
    </div>
  );
}
