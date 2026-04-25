import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loading } from './Loading';

interface LoadingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Loading variant to show */
  loadingVariant?: 'spinner' | 'dots' | 'pulse';
  /** Loading text to display */
  loadingText?: string;
  /** Children to render when not loading */
  children: ReactNode;
  /** Custom loading className */
  loadingClassName?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingVariant = 'spinner',
  loadingText = 'Loading...',
  children,
  className = '',
  loadingClassName = '',
  disabled,
  ...props
}) => {
  const isDisabled = loading || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center
        ${loading ? 'pointer-events-none' : ''}
        ${isDisabled ? 'opacity-60' : ''}
        ${className}
      `}
      aria-busy={loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading 
            variant={loadingVariant} 
            size="sm" 
            inline 
            className={loadingClassName}
          />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
      {loading && (
        <span className="sr-only">
          {loadingText}
        </span>
      )}
    </button>
  );
};

export default LoadingButton;
