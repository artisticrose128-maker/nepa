import React from 'react';
import { ToastNotification } from './ToastNotification';
import { useNotifications } from '../contexts/NotificationContext';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastContainerProps {
  position?: ToastPosition;
  maxVisible?: number;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxVisible = 5,
  className = ''
}) => {
  const { notifications, removeNotification } = useNotifications();

  const getPositionClasses = (pos: ToastPosition): string => {
    switch (pos) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      case 'top-center':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  const getStackDirection = (pos: ToastPosition): string => {
    switch (pos) {
      case 'top-right':
      case 'top-left':
      case 'top-center':
        return 'flex-col-reverse';
      case 'bottom-right':
      case 'bottom-left':
      case 'bottom-center':
        return 'flex-col';
      default:
        return 'flex-col-reverse';
    }
  };

  const handleNotificationAction = (notification: any, actionIndex: number) => {
    if (notification.actions && notification.actions[actionIndex]) {
      notification.actions[actionIndex].action();
    }
  };

  // Limit visible notifications
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div 
      className={`
        ${getPositionClasses(position)}
        ${className}
        flex ${getStackDirection(position)}
        gap-2
        pointer-events-none
      `}
    >
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ToastNotification
            notification={notification}
            onClose={removeNotification}
            onAction={handleNotificationAction}
            position={position}
          />
        </div>
      ))}
    </div>
  );
};
