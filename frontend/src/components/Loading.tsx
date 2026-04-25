import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  label?: string;
  fullscreen?: boolean;
  inline?: boolean;
  className?: string;
}

export const Loading: React.FC<Props> = ({ 
  size = 'md', 
  variant = 'spinner', 
  label, 
  fullscreen = false,
  inline = false,
  className = ''
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'spinner-sm';
      case 'md': return 'spinner-md';
      case 'lg': return 'spinner-lg';
      case 'xl': return 'spinner-xl';
      default: return 'spinner-md';
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex items-center justify-center';
    const directionClasses = inline ? 'flex-row gap-2' : 'flex-col gap-4';
    const sizeClasses = fullscreen ? 'min-h-screen' : 'min-h-32';
    const customClasses = className;
    
    return `${baseClasses} ${directionClasses} ${sizeClasses} ${customClasses}`;
  };

  const renderSpinner = () => (
    <div className={`spinner ${getSpinnerSize()}`} />
  );

  const renderDots = () => (
    <div className="dots-loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  const renderPulse = () => (
    <div className={`pulse-loading ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} />
  );

  const renderSkeleton = () => {
    const skeletonClasses = size === 'sm' ? 'skeleton-text-sm' : 
                           size === 'lg' ? 'skeleton-text-lg' : 
                           'skeleton-text-md';
    return (
      <div className="w-full space-y-2">
        <div className={skeletonClasses} />
        <div className="skeleton-text" />
        <div className="skeleton-text w-3/4" />
      </div>
    );
  };

  const renderVariant = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'skeleton': return renderSkeleton();
      default: return renderSpinner();
    }
  };

  const renderLabel = () => {
    if (!label) return null;
    
    const labelClasses = inline 
      ? 'loading-message text-sm font-medium'
      : 'loading-message-lg text-base font-medium';
    
    return <p className={labelClasses}>{label}</p>;
  };

  if (fullscreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          {renderVariant()}
          {renderLabel()}
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClasses()}>
      {renderVariant()}
      {renderLabel()}
    </div>
  );
};
