import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export interface ErrorToastProps {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  isVisible: boolean;
  onDismiss: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  type = 'error',
  duration = 5000,
  isVisible,
  onDismiss,
  action,
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          onDismiss();
        }, 300); // Animation duration
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  const getIcon = () => {
    const iconProps = {
      size: 20,
      className: "toast-icon",
      'aria-hidden': true
    };

    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'error':
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'toast--success';
      case 'warning':
        return 'toast--warning';
      case 'info':
        return 'toast--info';
      case 'error':
      default:
        return 'toast--error';
    }
  };

  const getAriaRole = () => {
    if (type === 'error' || type === 'warning') {
      return 'alert';
    }
    return 'status';
  };

  const getAriaLive = () => {
    if (type === 'error' || type === 'warning') {
      return 'assertive';
    }
    return 'polite';
  };

  if (!isVisible) return null;

  return (
    <div
      className={`toast ${getTypeClass()} ${isLeaving ? 'toast--leaving' : 'toast--entering'} ${className}`}
      role={getAriaRole()}
      aria-live={getAriaLive()}
      aria-atomic="true"
    >
      <div className="toast-content">
        {/* Icon */}
        <div className="toast-icon-container">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="toast-message">
          <p className="toast-text">{message}</p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="toast-progress">
              <div 
                className="toast-progress-bar"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('errorToast.progressLabel', 'Progress: {{progress}}%', { progress })}
              />
            </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="toast-action"
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => onDismiss(), 300);
          }}
          className="toast-dismiss"
          aria-label={t('errorToast.dismiss', 'Dismiss notification')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Auto-dismiss Timer */}
      {duration > 0 && (
        <div 
          className="toast-timer"
          style={{ 
            animationDuration: `${duration}ms`,
            animationPlayState: isVisible ? 'running' : 'paused'
          }}
        />
      )}
    </div>
  );
};

export default ErrorToast;
