import React, { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'square';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  src?: string;
  alt?: string;
  /** Fallback initials (up to 2 chars) */
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  className?: string;
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6',   text: 'text-[10px]' },
  sm: { container: 'w-8 h-8',   text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
};

const statusClasses: Record<AvatarStatus, string> = {
  online:  'bg-success',
  offline: 'bg-muted-foreground',
  away:    'bg-warning',
  busy:    'bg-destructive',
};

const statusLabels: Record<AvatarStatus, string> = {
  online:  'Online',
  offline: 'Offline',
  away:    'Away',
  busy:    'Busy',
};

/** Derive up to 2 initials from a name string */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const { container, text } = sizeClasses[size];
  const shapeClass = shapeClasses[shape];
  const fallbackInitials = initials
    ? initials.slice(0, 2).toUpperCase()
    : alt ? getInitials(alt) : '?';

  const showImage = src && !imgError;

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden bg-muted select-none ${container} ${shapeClass} ${className}`}
      aria-label={alt || initials || 'Avatar'}
      role="img"
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`font-medium text-muted-foreground ${text}`} aria-hidden="true">
          {fallbackInitials}
        </span>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background w-2.5 h-2.5 ${statusClasses[status]}`}
          aria-label={statusLabels[status]}
          role="status"
        />
      )}
    </span>
  );
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  size = 'md',
  className = '',
}) => {
  const childArray = React.Children.toArray(children);
  const visible = max ? childArray.slice(0, max) : childArray;
  const overflow = max ? childArray.length - max : 0;
  const { container, text } = sizeClasses[size];
  const overlapClass = '-ml-2 first:ml-0';

  return (
    <div
      className={`flex items-center ${className}`}
      role="group"
      aria-label={`${childArray.length} avatars`}
    >
      {visible.map((child, i) => (
        <span key={i} className={`relative inline-flex ${overlapClass} ring-2 ring-background rounded-full`}>
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`relative inline-flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground font-medium rounded-full ring-2 ring-background ${overlapClass} ${container} ${text}`}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};
