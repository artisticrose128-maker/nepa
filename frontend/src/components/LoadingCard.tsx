import React, { ReactNode } from 'react';
import { Skeleton } from './Skeleton';

interface LoadingCardProps {
  /** Number of skeleton lines to show */
  lines?: number;
  /** Show avatar skeleton */
  showAvatar?: boolean;
  /** Show button skeleton */
  showButton?: boolean;
  /** Custom title skeleton width */
  titleWidth?: string;
  /** Custom className */
  className?: string;
  /** Custom height for the card */
  height?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  showButton = false,
  titleWidth = '60%',
  className = '',
  height = '200px',
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      style={{ height }}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-4">
            <Skeleton variant="avatar" />
            <div className="flex-1">
              <Skeleton variant="text" width={titleWidth} height="1.25rem" />
              <Skeleton variant="text" width="40%" height="0.875rem" />
            </div>
          </div>
        )}
        
        {!showAvatar && (
          <Skeleton variant="text" width={titleWidth} height="1.25rem" />
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? '80%' : '100%'}
              height="1rem"
            />
          ))}
        </div>
        
        {showButton && (
          <div className="flex justify-end space-x-2 pt-4">
            <Skeleton variant="button" width="80px" />
            <Skeleton variant="button" width="100px" />
          </div>
        )}
      </div>
      
      <span className="sr-only">Loading card content...</span>
    </div>
  );
};

interface LoadingGridProps {
  /** Number of cards to show */
  count?: number;
  /** Props to pass to each LoadingCard */
  cardProps?: Omit<LoadingCardProps, 'className'>;
  /** Grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Custom className */
  className?: string;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  count = 6,
  cardProps = {},
  columns = 3,
  className = '',
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div 
      className={`grid ${gridCols[columns]} gap-6 ${className}`}
      role="status"
      aria-label={`Loading ${count} items`}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} {...cardProps} />
      ))}
      <span className="sr-only">Loading grid content...</span>
    </div>
  );
};

export default LoadingCard;
