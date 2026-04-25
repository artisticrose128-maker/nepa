import React from 'react';

type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Show a remove/delete button */
  onRemove?: () => void;
  /** Make the chip clickable/selectable */
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<ChipVariant, string> = {
  default:     'bg-secondary text-secondary-foreground border-transparent',
  primary:     'bg-primary text-primary-foreground border-transparent',
  success:     'bg-success/10 text-success border-success/30',
  warning:     'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  outline:     'bg-transparent text-foreground border-border',
};

const sizeClasses: Record<ChipSize, { chip: string; icon: string; remove: string }> = {
  sm: { chip: 'text-xs px-2 py-0.5 gap-1',   icon: 'w-3 h-3', remove: 'w-3 h-3' },
  md: { chip: 'text-sm px-3 py-1 gap-1.5',   icon: 'w-4 h-4', remove: 'w-3.5 h-3.5' },
  lg: { chip: 'text-base px-4 py-1.5 gap-2', icon: 'w-5 h-5', remove: 'w-4 h-4' },
};

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'md',
  icon,
  onRemove,
  onClick,
  selected = false,
  disabled = false,
  className = '',
}) => {
  const { chip, icon: iconSize, remove: removeSize } = sizeClasses[size];
  const isInteractive = !!onClick;

  const baseClasses = `
    inline-flex items-center rounded-full border font-medium
    transition-all duration-150 select-none
    ${chip}
    ${variantClasses[variant]}
    ${selected ? 'ring-2 ring-ring ring-offset-1' : ''}
    ${disabled ? 'opacity-50 pointer-events-none' : ''}
    ${isInteractive ? 'cursor-pointer hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const Tag = isInteractive ? 'button' : 'span';

  return (
    <Tag
      {...(isInteractive
        ? {
            type: 'button' as const,
            onClick,
            'aria-pressed': selected,
            disabled,
          }
        : {})}
      className={baseClasses}
      aria-label={label}
    >
      {icon && (
        <span className={`flex-shrink-0 ${iconSize}`} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove ${label}`}
          disabled={disabled}
          className={`flex-shrink-0 ml-0.5 rounded-full opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-opacity ${removeSize}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </Tag>
  );
};
