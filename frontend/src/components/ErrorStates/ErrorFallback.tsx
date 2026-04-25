import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  retry?: () => void;
  variant?: 'full' | 'partial' | 'inline';
  showRetry?: boolean;
  showReset?: boolean;
  showDetails?: boolean;
  customMessage?: string;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  retry,
  variant = 'full',
  showRetry = true,
  showReset = true,
  showDetails = true,
  customMessage,
  className = ''
}) => {
  const { t } = useTranslation();

  const errorMessage = customMessage || error?.message || t('error.fallback.unknown', 'An unknown error occurred');
  const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const renderFullFallback = () => (
    <div className={`error-fallback error-fallback--full ${className}`} role="alert" aria-live="assertive">
      <div className="error-fallback-container">
        {/* Error Icon and Title */}
        <div className="error-fallback-header">
          <div className="error-fallback-icon">
            <AlertTriangle size={48} className="text-red-500" aria-hidden="true" />
          </div>
          <div className="error-fallback-title">
            <h1 className="error-fallback-title-text">
              {t('error.fallback.title', 'Something went wrong')}
            </h1>
            <p className="error-fallback-subtitle">
              {t('error.fallback.subtitle', 'We encountered an unexpected error')}
            </p>
          </div>
        </div>

        {/* Error Message */}
        <div className="error-fallback-message">
          <div className="error-fallback-message-content">
            <p className="error-fallback-description">
              {errorMessage}
            </p>
            <p className="error-fallback-id">
              {t('error.fallback.errorId', 'Error ID')}: {errorId}
            </p>
          </div>
        </div>

        {/* Error Details */}
        {showDetails && error && (
          <details className="error-fallback-details">
            <summary className="error-fallback-details-summary">
              <Bug size={16} className="mr-2" />
              {t('error.fallback.technicalDetails', 'Technical details')}
            </summary>
            <div className="error-fallback-details-content">
              <div className="error-fallback-section">
                <h3 className="error-fallback-section-title">
                  {t('error.fallback.errorName', 'Error Name')}
                </h3>
                <code className="error-fallback-code">{error.name}</code>
              </div>
              
              {error.stack && (
                <div className="error-fallback-section">
                  <h3 className="error-fallback-section-title">
                    {t('error.fallback.errorStack', 'Error Stack')}
                  </h3>
                  <pre className="error-fallback-stack">
                    <code>{error.stack}</code>
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Error Actions */}
        <div className="error-fallback-actions">
          {showRetry && retry && (
            <button
              onClick={retry}
              className="error-fallback-button error-fallback-button--primary"
              aria-label={t('error.fallback.retryAction', 'Retry the last action')}
            >
              <RefreshCw size={16} className="mr-2" />
              {t('error.fallback.retry', 'Try Again')}
            </button>
          )}

          {showReset && (
            <button
              onClick={resetError}
              className="error-fallback-button error-fallback-button--secondary"
              aria-label={t('error.fallback.resetAction', 'Reset error state')}
            >
              {t('error.fallback.reset', 'Start Over')}
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="error-fallback-button error-fallback-button--outline"
            aria-label={t('error.fallback.homeAction', 'Go to homepage')}
          >
            <Home size={16} className="mr-2" />
            {t('error.fallback.home', 'Go Home')}
          </button>
        </div>

        {/* Support Information */}
        <div className="error-fallback-support">
          <div className="error-fallback-support-content">
            <h3 className="error-fallback-support-title">
              {t('error.fallback.needHelp', 'Need Help?')}
            </h3>
            <p className="error-fallback-support-description">
              {t('error.fallback.supportText', 'If this problem continues, our support team is here to help')}
            </p>
            <div className="error-fallback-support-actions">
              <button
                onClick={() => window.location.href = 'mailto:support@nepa.com'}
                className="error-fallback-link"
                aria-label={t('error.fallback.contactSupport', 'Contact support team')}
              >
                {t('error.fallback.contactSupport', 'Contact Support')}
              </button>
              <button
                onClick={() => window.location.href = '/faq'}
                className="error-fallback-link"
                aria-label={t('error.fallback.viewFAQ', 'View frequently asked questions')}
              >
                {t('error.fallback.faq', 'View FAQ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPartialFallback = () => (
    <div className={`error-fallback error-fallback--partial ${className}`} role="alert" aria-live="polite">
      <div className="error-fallback-inline">
        <AlertTriangle size={20} className="error-fallback-inline-icon" aria-hidden="true" />
        <div className="error-fallback-inline-content">
          <p className="error-fallback-inline-message">{errorMessage}</p>
          <div className="error-fallback-inline-actions">
            {showRetry && retry && (
              <button
                onClick={retry}
                className="error-fallback-inline-button"
                aria-label={t('error.fallback.retryAction', 'Retry the last action')}
              >
                <RefreshCw size={14} className="mr-1" />
                {t('error.fallback.retry', 'Retry')}
              </button>
            )}
            {showReset && (
              <button
                onClick={resetError}
                className="error-fallback-inline-button"
                aria-label={t('error.fallback.resetAction', 'Reset error state')}
              >
                {t('error.fallback.reset', 'Reset')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInlineFallback = () => (
    <div className={`error-fallback error-fallback--inline ${className}`} role="alert" aria-live="polite">
      <div className="error-fallback-inline-compact">
        <AlertTriangle size={16} className="error-fallback-compact-icon" aria-hidden="true" />
        <span className="error-fallback-compact-message">{errorMessage}</span>
        {showRetry && retry && (
          <button
            onClick={retry}
            className="error-fallback-compact-button"
            aria-label={t('error.fallback.retryAction', 'Retry the last action')}
            title={t('error.fallback.retry', 'Retry')}
          >
            <RefreshCw size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case 'partial':
      return renderPartialFallback();
    case 'inline':
      return renderInlineFallback();
    default:
      return renderFullFallback();
  }
};

export default ErrorFallback;
