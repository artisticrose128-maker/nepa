import React from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  padding?: ContainerPadding;
  /** Center the container horizontally */
  centered?: boolean;
  as?: React.ElementType;
  className?: string;
}

const maxWidthClasses: Record<ContainerSize, string> = {
  sm:   'max-w-screen-sm',
  md:   'max-w-screen-md',
  lg:   'max-w-screen-lg',
  xl:   'max-w-screen-xl',
  '2xl':'max-w-screen-2xl',
  full: 'max-w-full',
};

const paddingClasses: Record<ContainerPadding, string> = {
  none: '',
  sm:   'px-4 py-2',
  md:   'px-4 sm:px-6 lg:px-8',
  lg:   'px-6 sm:px-8 lg:px-12',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  padding = 'md',
  centered = true,
  as: Tag = 'div',
  className = '',
}) => (
  <Tag
    className={`
      w-full
      ${maxWidthClasses[size]}
      ${paddingClasses[padding]}
      ${centered ? 'mx-auto' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ')}
  >
    {children}
  </Tag>
);
