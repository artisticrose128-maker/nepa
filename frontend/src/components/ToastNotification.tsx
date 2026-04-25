import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification, NotificationType } from '../contexts/NotificationContext';

interface ToastNotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
  onAction?: (notification: Notification, actionIndex: number) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  onAction,
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Animation on mount
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle auto-dismiss
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, notification.duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Match animation duration
  };

  const handleAction = (actionIndex: number) => {
    if (onAction && notification.actions && notification.actions[actionIndex]) {
      onAction(notification, actionIndex);
    }
  };

  const getIcon = (type: NotificationType) => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-gray-500`} />;
    }
  };

  const getColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'translate-x-0';
      case 'top-left':
        return 'translate-x-0';
      case 'bottom-right':
        return 'translate-x-0';
      case 'bottom-left':
        return 'translate-x-0';
      case 'top-center':
        return 'translate-x-0';
      case 'bottom-center':
        return 'translate-x-0';
      default:
        return 'translate-x-0';
    }
  };

  return (
    <div
      ref={notificationRef}
      className={`
        relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getColors(notification.type)}
        ${getPositionClasses()}
        ${className}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
        ${isLeaving ? 'opacity-0 translate-y-2 scale-95' : ''}
        max-w-md w-full
      `}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-3">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 mr-2">
        <h4 className="text-sm font-semibold mb-1 leading-tight">
          {notification.title}
        </h4>
        {notification.message && (
          <p className="text-sm opacity-90 leading-relaxed">
            {notification.message}
          </p>
        )}
        
        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(index)}
                className={`
                  text-xs px-3 py-1 rounded font-medium transition-colors
                  ${action.variant === 'primary' 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
        aria-label="Dismiss notification"
        type="button"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-black bg-opacity-40 rounded-b-lg transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
