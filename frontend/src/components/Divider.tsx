import React from 'react';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'solid' | 'dashed' | 'dotted';
type DividerWeight = 'thin' | 'base' | 'thick';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  weight?: DividerWeight;
  /** Optional label rendered in the middle of a horizontal divider */
  label?: React.ReactNode;
  /** Alignment of the label */
  labelAlign?: 'start' | 'center' | 'end';
  className?: string;
}

const borderStyle: Record<DividerVariant, string> = {
  solid:  'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

const borderWeight: Record<DividerWeight, string> = {
  thin:  'border-[0.5px]',
  base:  'border',
  thick: 'border-2',
};

const labelAlignClass: Record<'start' | 'center' | 'end', string> = {
  start:  'justify-start',
  center: 'justify-center',
  end:    'justify-end',
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  weight = 'base',
  label,
  labelAlign = 'center',
  className = '',
}) => {
  const borderClasses = `${borderStyle[variant]} ${borderWeight[weight]} border-border`;

  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block self-stretch ${borderClasses} border-l ${className}`}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`flex items-center gap-3 w-full ${labelAlignClass[labelAlign]} ${className}`}
      >
        {labelAlign !== 'start' && (
          <span className={`flex-1 ${borderClasses} border-t ${labelAlign === 'end' ? 'flex-none w-8' : ''}`} />
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap px-1 select-none">
          {label}
        </span>
        {labelAlign !== 'end' && (
          <span className={`flex-1 ${borderClasses} border-t ${labelAlign === 'start' ? 'flex-none w-8' : ''}`} />
        )}
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={`w-full ${borderClasses} border-t border-l-0 border-r-0 border-b-0 m-0 ${className}`}
    />
  );
};
