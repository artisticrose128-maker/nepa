import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  animate?: boolean;
  className?: string;
  'aria-label'?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     'bg-secondary text-secondary-foreground border-transparent',
  primary:     'bg-primary text-primary-foreground border-transparent',
  secondary:   'bg-secondary text-secondary-foreground border-transparent',
  success:     'bg-success/10 text-success border-success/30',
  warning:     'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  info:        'bg-info/10 text-info border-info/30',
  outline:     'bg-transparent text-foreground border-border',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  icon,
  animate = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const classes = [
    'inline-flex items-center gap-1 rounded-full border font-medium',
    variantClasses[variant],
    sizeClasses[size],
    animate ? 'animate-badge-fade-in' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-label={ariaLabel}>
      {icon && (
        <span aria-hidden="true" className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>
    </span>
  );
};

export default Badge;
