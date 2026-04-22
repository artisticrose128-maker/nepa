import React from 'react';
import { NetworkStatus } from '../services/networkStatusService';
import { ErrorHandler } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: string | null;
  networkStatus: NetworkStatus;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  className?: string;
  variant?: 'inline' | 'card' | 'toast' | 'modal';
  title?: string;
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  networkStatus,
  onRetry,
  onDismiss,
  retryCount = 0,
  className = '',
  variant = 'card',
  title,
  showIcon = true
}) => {
  if (!error) return null;

  const getErrorIcon = () => {
    const iconClass = "error-icon";
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25zm0 0a9.75 9.75 0 00-9.75 9.75" />
          </svg>
        );
      case NetworkStatus.SLOW:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NetworkStatus.UNSTABLE:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorVariant = () => {
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
        return 'error-critical';
      case NetworkStatus.SLOW:
        return 'error-warning';
      case NetworkStatus.UNSTABLE:
        return 'error-warning';
      default:
        return 'error-critical';
    }
  };

  const getErrorTitle = () => {
    if (title) return title;
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
        return 'Connection Lost';
      case NetworkStatus.SLOW:
        return 'Slow Connection';
      case NetworkStatus.UNSTABLE:
        return 'Unstable Connection';
      default:
        return 'Error Occurred';
    }
  };

  const getErrorDescription = () => {
    switch (networkStatus) {
      case NetworkStatus.OFFLINE:
        return 'Please check your internet connection and try again.';
      case NetworkStatus.SLOW:
        return 'Your connection is slow. Operations may take longer than usual.';
      case NetworkStatus.UNSTABLE:
        return 'Your connection is unstable. Please wait for it to stabilize or try again.';
      default:
        return '';
    }
  };

  const getRetryText = () => {
    if (retryCount === 0) return 'Try Again';
    if (retryCount === 1) return 'Retry (1/3)';
    if (retryCount === 2) return 'Retry (2/3)';
    return 'Final Retry (3/3)';
  };

  const canRetry = onRetry && retryCount < 3;

  const renderInlineError = () => (
    <div className={`error-inline ${className}`}>
      {showIcon && <div className="error-inline-icon">{getErrorIcon()}</div>}
      <div className="error-inline-text">{error}</div>
    </div>
  );

  const renderCardError = () => (
    <div className={`card error-card ${getErrorVariant()} ${className}`}>
      <div className="card-content">
        <div className="flex items-start gap-4">
          {showIcon && <div className="flex-shrink-0">{getErrorIcon()}</div>}
          <div className="flex-1">
            <h3 className="card-title">{getErrorTitle()}</h3>
            <p className="card-description">{error}</p>
            {getErrorDescription() && (
              <p className="card-description mt-2">{getErrorDescription()}</p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="btn btn-ghost btn-sm"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {(canRetry || networkStatus === NetworkStatus.OFFLINE) && (
        <div className="card-footer">
          {canRetry && (
            <button onClick={onRetry} className="btn btn-primary btn-sm">
              {getRetryText()}
            </button>
          )}
          {networkStatus === NetworkStatus.OFFLINE && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline btn-sm"
            >
              Refresh Page
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderToastError = () => (
    <div className={`error-toast ${className}`}>
      {showIcon && <div className="error-toast-icon">{getErrorIcon()}</div>}
      <div className="error-toast-content">
        <h4 className="error-toast-title">{getErrorTitle()}</h4>
        <p className="error-toast-message">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="error-toast-close"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );

  const renderModalError = () => (
    <div className="error-modal">
      <div className={`error-modal-content ${getErrorVariant()} ${className}`}>
        {showIcon && <div className="error-modal-icon">{getErrorIcon()}</div>}
        <h2 className="error-modal-title">{getErrorTitle()}</h2>
        <p className="error-modal-message">{error}</p>
        {getErrorDescription() && (
          <p className="error-modal-message">{getErrorDescription()}</p>
        )}

        <div className="error-modal-actions">
          {canRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              {getRetryText()}
            </button>
          )}
          {networkStatus === NetworkStatus.OFFLINE && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              Refresh Page
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="btn btn-secondary">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'inline':
      return renderInlineError();
    case 'toast':
      return renderToastError();
    case 'modal':
      return renderModalError();
    default:
      return renderCardError();
  }
};

export default ErrorDisplay;
