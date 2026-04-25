import React from 'react';

type ProgressVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  /** Value between 0 and max */
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text (overrides percentage) */
  label?: string;
  /** Animate the bar on mount */
  animated?: boolean;
  /** Indeterminate / unknown progress */
  indeterminate?: boolean;
  className?: string;
}

const variantColor: Record<ProgressVariant, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
};

const sizeHeight: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  indeterminate = false,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const displayLabel = label ?? `${Math.round(pct)}%`;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">{displayLabel}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? `${Math.round(pct)}% complete`}
        aria-valuetext={indeterminate ? 'Loading…' : displayLabel}
        className={`progress ${sizeHeight[size]} overflow-hidden`}
      >
        <div
          className={`
            progress-bar ${variantColor[variant]}
            ${animated && !indeterminate ? 'transition-[width] duration-500 ease-out' : ''}
            ${indeterminate ? 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite] w-1/3' : ''}
          `}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>

      {/* Indeterminate keyframe — injected once via a style tag */}
      {indeterminate && (
        <style>{`
          @keyframes progress-indeterminate {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      )}
    </div>
  );
};
