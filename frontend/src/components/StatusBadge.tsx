import React from 'react';

export type StatusValue = 'active' | 'inactive' | 'pending' | 'error' | 'warning';

interface StatusBadgeProps {
  status: StatusValue;
  label?: string;
  className?: string;
}

const statusClasses: Record<StatusValue, { dot: string; text: string }> = {
  active:   { dot: 'bg-success',          text: 'text-success' },
  inactive: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  pending:  { dot: 'bg-warning',          text: 'text-warning' },
  error:    { dot: 'bg-destructive',      text: 'text-destructive' },
  warning:  { dot: 'bg-warning',          text: 'text-warning' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const { dot, text } = statusClasses[status];

  const containerClasses = [
    'inline-flex items-center gap-1.5',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={containerClasses} aria-label={`Status: ${status}`}>
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
      />
      {label !== undefined && (
        <span className={text}>{label}</span>
      )}
    </span>
  );
};

export default StatusBadge;
