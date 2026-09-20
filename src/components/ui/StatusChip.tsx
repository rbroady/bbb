'use client';
import { CompanyStatus } from '@/types';

type StatusValue = CompanyStatus | string;

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  saved: 'Saved',
  passed: 'Passed',
  contacted: 'Contacted',
  evaluating: 'Evaluating',
  loi: 'LOI',
  diligence: 'Diligence',
  closed: 'Closed',
  Active: 'Active',
  Paused: 'Paused',
  Running: 'Running',
};

const statusStyles: Record<string, string> = {
  new: 'bg-bg-subtle text-text-secondary',
  saved: 'bg-accent-soft text-accent-ink',
  passed: 'bg-bg-subtle text-text-disabled',
  contacted: 'bg-info-soft text-info',
  evaluating: 'bg-warning-soft text-warning',
  loi: 'bg-positive-soft text-positive',
  diligence: 'bg-positive-soft text-positive',
  closed: 'bg-accent-soft text-accent-ink',
  Active: 'bg-positive-soft text-positive',
  Paused: 'bg-bg-subtle text-text-secondary',
  Running: 'bg-info-soft text-info',
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
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-flex items-center rounded-full font-medium leading-none ${sizeClass} ${style}`}>
      {label}
    </span>
  );
}
