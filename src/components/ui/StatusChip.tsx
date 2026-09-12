'use client';
import { CompanyStatus, PipelineStage } from '@/types';

type StatusValue = CompanyStatus | PipelineStage | string;

const statusStyles: Record<string, string> = {
  'Prime': 'bg-accent-soft text-accent-ink',
  'Off-market': 'bg-bg-subtle text-text-secondary',
  'For sale': 'bg-info-soft text-info',
  'Watching': 'bg-bg-subtle text-text-secondary',
  'Contacted': 'bg-info-soft text-info',
  'Analyzing': 'bg-warning-soft text-warning',
  'LOI': 'bg-positive-soft text-positive',
  'Under Contract': 'bg-positive-soft text-positive',
  'Initial Conversation': 'bg-info-soft text-info',
  'Due Diligence': 'bg-warning-soft text-warning',
  'Passed': 'bg-bg-subtle text-text-disabled',
  'Active': 'bg-positive-soft text-positive',
  'Paused': 'bg-bg-subtle text-text-secondary',
  'Running': 'bg-info-soft text-info',
};

interface StatusChipProps {
  status: StatusValue;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const style = statusStyles[status] ?? 'bg-bg-subtle text-text-secondary';
  const sizeClass = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 h-5'
    : 'text-[12px] px-2.5 py-0.5 h-[22px]';

  return (
    <span className={`inline-flex items-center rounded-full font-medium leading-none ${sizeClass} ${style}`}>
      {status}
    </span>
  );
}
