import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  showDetails?: boolean;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      retryCount: 0
    };
  }

  generateErrorId = (): string => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send to error reporting service
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      }).catch(reportError => {
        console.error('Failed to report error:', reportError);
      });
    } catch (reportError) {
      console.error('Error reporting failed:', reportError);
    }
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      // Clear any retry timeout
      if (this.retryTimeoutId) {
        clearTimeout(this.retryTimeoutId);
      }
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    // Clear retry timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { t } = useTranslation();
    const { 
      children, 
      fallback, 
      enableRetry = true, 
      maxRetries = 3,
      showDetails = true,
      className = ''
    } = this.props;

    const { hasError, error, errorInfo, errorId, retryCount } = this.state;

    if (!hasError) {
      return <>{children}</>;
    }

    // Custom fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    const canRetry = enableRetry && retryCount < maxRetries;
    const isLastRetry = retryCount >= maxRetries - 1;

    return (
      <div 
        className={`error-boundary ${className}`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="error-boundary-content">
          {/* Error Header */}
          <div className="error-boundary-header">
            <div className="error-boundary-icon">
              <AlertTriangle 
                size={48} 
                className="text-red-500"
                aria-hidden="true"
              />
            </div>
            <div className="error-boundary-title">
              <h1 className="error-boundary-title-text">
                {t('errorBoundary.title', 'Something went wrong')}
              </h1>
              <p className="error-boundary-subtitle">
                {t('errorBoundary.subtitle', 'An unexpected error occurred')}
              </p>
            </div>
          </div>

          {/* Error Message */}
          <div className="error-boundary-message">
            <div className="error-boundary-message-content">
              <p className="error-boundary-description">
                {error?.message || t('errorBoundary.unknownError', 'Unknown error occurred')}
              </p>
              
              {errorId && (
                <p className="error-boundary-id">
                  {t('errorBoundary.errorId', 'Error ID')}: {errorId}
                </p>
              )}
            </div>
          </div>

          {/* Error Details */}
          {showDetails && errorInfo && (
            <details className="error-boundary-details">
              <summary className="error-boundary-details-summary">
                {t('errorBoundary.showDetails', 'Show error details')}
              </summary>
              <div className="error-boundary-details-content">
                <div className="error-boundary-section">
                  <h3 className="error-boundary-section-title">
                    {t('errorBoundary.componentStack', 'Component Stack')}
                  </h3>
                  <pre className="error-boundary-code">
                    {errorInfo.componentStack}
                  </pre>
                </div>
                
                {error?.stack && (
                  <div className="error-boundary-section">
                    <h3 className="error-boundary-section-title">
                      {t('errorBoundary.errorStack', 'Error Stack')}
                    </h3>
                    <pre className="error-boundary-code">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Error Actions */}
          <div className="error-boundary-actions">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="error-boundary-button error-boundary-button--primary"
                aria-label={t('errorBoundary.retry', 'Retry action')}
              >
                <RefreshCw size={16} className="mr-2" />
                {isLastRetry 
                  ? t('errorBoundary.finalRetry', 'Final Retry')
                  : t('errorBoundary.retry', 'Retry')
                }
                {retryCount > 0 && (
                  <span className="error-boundary-retry-count">
                    ({retryCount + 1}/{maxRetries})
                  </span>
                )}
              </button>
            )}

            <button
              onClick={this.handleReset}
              className="error-boundary-button error-boundary-button--secondary"
              aria-label={t('errorBoundary.reset', 'Reset error state')}
            >
              {t('errorBoundary.reset', 'Reset')}
            </button>

            <button
              onClick={this.handleGoHome}
              className="error-boundary-button error-boundary-button--outline"
              aria-label={t('errorBoundary.goHome', 'Go to homepage')}
            >
              <Home size={16} className="mr-2" />
              {t('errorBoundary.goHome', 'Go Home')}
            </button>
          </div>

          {/* Support Info */}
          <div className="error-boundary-support">
            <p className="error-boundary-support-text">
              {t('errorBoundary.support', 'If this problem persists, please contact support')}
            </p>
            <button
              onClick={() => window.location.href = 'mailto:support@nepa.com'}
              className="error-boundary-link"
              aria-label={t('errorBoundary.contactSupport', 'Contact support')}
            >
              {t('errorBoundary.contactSupport', 'Contact Support')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
