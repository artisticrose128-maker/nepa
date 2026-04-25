import React, { useEffect, useRef, useState } from 'react';
import { type BadgeVariant } from './Badge';

interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     'bg-secondary text-secondary-foreground',
  primary:     'bg-primary text-primary-foreground',
  secondary:   'bg-secondary text-secondary-foreground',
  success:     'bg-success text-white',
  warning:     'bg-warning text-white',
  destructive: 'bg-destructive text-white',
  info:        'bg-info text-white',
  outline:     'bg-transparent text-foreground border border-border',
};

function sanitizeCount(count: number | undefined): number {
  if (count === undefined) return 0;
  if (typeof count !== 'number' || isNaN(count) || count < 0) return 0;
  return Math.floor(count);
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max,
  showZero = false,
  dot = false,
  variant = 'destructive',
  children,
}) => {
  const safeCount = sanitizeCount(count);
  const prevCountRef = useRef<number>(safeCount);
  const [isPulsing, setIsPulsing] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const shouldShow = dot || safeCount > 0 || showZero;
  const wasVisibleRef = useRef(shouldShow);

  useEffect(() => {
    if (safeCount > prevCountRef.current) {
      setIsPulsing(false);
      requestAnimationFrame(() => setIsPulsing(true));
    }
    prevCountRef.current = safeCount;
  }, [safeCount]);

  useEffect(() => {
    if (shouldShow && !wasVisibleRef.current) {
      setMountKey(k => k + 1);
    }
    wasVisibleRef.current = shouldShow;
  }, [shouldShow]);

  useEffect(() => {
    if (!isPulsing) return;
    const timer = setTimeout(() => setIsPulsing(false), 300);
    return () => clearTimeout(timer);
  }, [isPulsing]);

  let displayText: string | null = null;
  let ariaLabel: string | undefined;

  if (dot) {
    ariaLabel = 'New notifications';
  } else if (shouldShow) {
    displayText = max && max > 0 && safeCount > max ? `${max}+` : String(safeCount);
    if (safeCount > 0) {
      ariaLabel = `${safeCount} notifications`;
    }
  }

  const indicatorClasses = [
    'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'flex items-center justify-center rounded-full text-xs font-bold',
    dot ? 'w-2.5 h-2.5' : 'min-w-[1.25rem] h-5 px-1',
    variantClasses[variant],
    'animate-badge-scale-in',
    isPulsing ? 'animate-badge-pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className="inline-flex relative" role="status">
      {children}
      {shouldShow && (
        <span
          key={mountKey}
          className={indicatorClasses}
          aria-label={ariaLabel}
          role={ariaLabel ? 'status' : undefined}
        >
          {!dot && displayText}
        </span>
      )}
    </span>
  );
};

export default NotificationBadge;
