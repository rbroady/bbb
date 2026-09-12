'use client';

interface FinancialValueProps {
  value: number | null;
  format?: 'currency' | 'multiple' | 'percent' | 'number' | 'dscr';
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  muted?: boolean;
  positive?: boolean;
  negative?: boolean;
}

function fmt(value: number, format: string, compact: boolean): string {
  switch (format) {
    case 'currency':
      if (compact) {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    case 'multiple':
      return `${value.toFixed(1)}x`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    case 'dscr':
      return value.toFixed(2);
    default:
      return String(value);
  }
}

const sizeClasses = {
  sm: 'text-[12px]',
  md: 'text-[14px]',
  lg: 'text-[18px]',
  xl: 'text-[28px]',
};

export function FinancialValue({ value, format = 'currency', compact = false, size = 'md', muted, positive, negative }: FinancialValueProps) {
  if (value === null) {
    return <span className="text-text-disabled tabular-nums">—</span>;
  }

  let colorClass = 'text-text-primary';
  if (muted) colorClass = 'text-text-secondary';
  if (positive) colorClass = 'text-positive';
  if (negative) colorClass = 'text-negative';

  return (
    <span className={`tabular-nums font-medium ${sizeClasses[size]} ${colorClass}`}>
      {fmt(value, format, compact)}
    </span>
  );
}
