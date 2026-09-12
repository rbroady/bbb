'use client';

interface ScoreBarProps {
  value: number;
  max: number;
  color?: 'accent' | 'warning' | 'positive' | 'info';
  height?: number;
  showLabel?: boolean;
}

const colorMap = {
  accent: 'bg-accent',
  warning: 'bg-warning',
  positive: 'bg-positive',
  info: 'bg-info',
};

export function ScoreBar({ value, max, color = 'accent', height = 5, showLabel = false }: ScoreBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = colorMap[color];

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="flex-1 rounded-full bg-bg-subtle overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] tabular-nums text-text-tertiary w-6 text-right">
          {value}
        </span>
      )}
    </div>
  );
}
