import React from 'react';

type SpacerSize = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
type SpacerAxis = 'vertical' | 'horizontal' | 'both';

interface SpacerProps {
  /** Size token matching the design system spacing scale */
  size?: SpacerSize;
  axis?: SpacerAxis;
  /** Grow to fill available space (flex contexts) */
  flex?: boolean;
  className?: string;
}

const sizeMap: Record<SpacerSize, string> = {
  1:  '0.25rem',
  2:  '0.5rem',
  3:  '0.75rem',
  4:  '1rem',
  5:  '1.25rem',
  6:  '1.5rem',
  8:  '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

export const Spacer: React.FC<SpacerProps> = ({
  size = 4,
  axis = 'vertical',
  flex = false,
  className = '',
}) => {
  const value = sizeMap[size];

  const style: React.CSSProperties = flex
    ? { flex: '1 1 auto' }
    : {
        display: 'block',
        width:  axis === 'horizontal' || axis === 'both' ? value : undefined,
        height: axis === 'vertical'   || axis === 'both' ? value : undefined,
        minWidth:  axis === 'horizontal' || axis === 'both' ? value : undefined,
        minHeight: axis === 'vertical'   || axis === 'both' ? value : undefined,
      };

  return (
    <span
      aria-hidden="true"
      data-testid="spacer"
      style={style}
      className={className}
    />
  );
};
