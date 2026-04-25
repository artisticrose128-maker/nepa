import React from 'react';
import { useLoadingContext } from '../contexts/LoadingContext';
import { Loading } from './Loading';

interface GlobalLoadingProps {
  /** Custom loading message to display */
  message?: string;
  /** Minimum duration to show loading (ms) */
  minDuration?: number;
  /** Custom overlay className */
  overlayClassName?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  message = 'Loading...',
  minDuration = 500,
  overlayClassName = '',
}) => {
  const { isAnyLoading } = useLoadingContext();

  if (!isAnyLoading()) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading overlay"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl max-w-sm mx-4">
        <Loading 
          variant="spinner" 
          size="lg" 
          label={message}
          className="text-center"
        />
      </div>
    </div>
  );
};

export default GlobalLoading;
