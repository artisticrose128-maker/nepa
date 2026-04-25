import React from 'react';

type CardVariant = 'default' | 'outline' | 'ghost' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  /** Make the card clickable */
  onClick?: () => void;
  /** Highlight / selected state */
  selected?: boolean;
  className?: string;
  as?: React.ElementType;
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default:  'card',
  outline:  'card border-2',
  ghost:    'rounded-lg p-6 bg-transparent border-0 shadow-none',
  elevated: 'card shadow-lg hover:shadow-xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onClick,
  selected = false,
  className = '',
  as: Tag = 'div',
}) => {
  const isInteractive = !!onClick;

  return (
    <Tag
      className={`
        ${variantClasses[variant]}
        ${isInteractive ? 'cursor-pointer transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : ''}
        ${selected ? 'ring-2 ring-ring border-ring' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
      {...(isInteractive ? { role: 'button', tabIndex: 0, 'aria-pressed': selected } : {})}
      onKeyDown={isInteractive ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
    >
      {children}
    </Tag>
  );
};

export const CardHeader: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <p className={`card-description ${className}`}>{children}</p>
);

export const CardContent: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

export const CardFooter: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
