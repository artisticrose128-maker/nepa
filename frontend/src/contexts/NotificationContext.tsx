import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 for persistent
  timestamp: Date;
  isRead: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationContextType {
  // Notification state
  notifications: Notification[];
  unreadCount: number;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
  
  // Notification settings
  autoHideDuration: number;
  setAutoHideDuration: (duration: number) => void;
  maxNotifications: number;
  setMaxNotifications: (max: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [autoHideDuration, setAutoHideDuration] = useState(5000); // 5 seconds default
  const [maxNotifications, setMaxNotifications] = useState(5);

  // Load persisted settings on mount
  useEffect(() => {
    const loadPersistedSettings = () => {
      try {
        const persistedDuration = localStorage.getItem('nepa-notification-duration');
        if (persistedDuration) {
          const duration = parseInt(persistedDuration, 10);
          if (!isNaN(duration) && duration > 0) {
            setAutoHideDuration(duration);
          }
        }

        const persistedMax = localStorage.getItem('nepa-max-notifications');
        if (persistedMax) {
          const max = parseInt(persistedMax, 10);
          if (!isNaN(max) && max > 0) {
            setMaxNotifications(max);
          }
        }
      } catch (error) {
        console.error('Failed to load persisted notification settings:', error);
      }
    };

    loadPersistedSettings();
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('nepa-notification-duration', autoHideDuration.toString());
  }, [autoHideDuration]);

  useEffect(() => {
    localStorage.setItem('nepa-max-notifications', maxNotifications.toString());
  }, [maxNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Auto-hide notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      isRead: false,
      duration: notification.duration ?? autoHideDuration,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the most recent maxNotifications
      return updated.slice(0, maxNotifications);
    });

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  const showError = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Error messages don't auto-hide by default
      ...options,
    });
  };

  const showWarning = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };

  const showInfo = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    autoHideDuration,
    setAutoHideDuration,
    maxNotifications,
    setMaxNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
