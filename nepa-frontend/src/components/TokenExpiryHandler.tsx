import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TokenExpiryNotification {
  message: string;
  level: 'warning' | 'critical';
  actionRequired: boolean;
}

interface SessionExpiredNotification {
  message: string;
}

export const TokenExpiryHandler: React.FC = () => {
  const [tokenExpiry, setTokenExpiry] = useState<TokenExpiryNotification | null>(null);
  const [sessionExpired, setSessionExpired] = useState<SessionExpiredNotification | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    // Listen for token expiry events
    const handleTokenExpiry = (event: CustomEvent) => {
      setTokenExpiry(event.detail);
    };

    const handleSessionExpired = (event: CustomEvent) => {
      setSessionExpired(event.detail);
      setTokenExpiry(null); // Clear any existing token expiry notifications
    };

    window.addEventListener('tokenExpiry', handleTokenExpiry as EventListener);
    window.addEventListener('sessionExpired', handleSessionExpired as EventListener);

    return () => {
      window.removeEventListener('tokenExpiry', handleTokenExpiry as EventListener);
      window.removeEventListener('sessionExpired', handleSessionExpired as EventListener);
    };
  }, []);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      // The authService will automatically handle the refresh
      // We just need to clear the notification
      setTokenExpiry(null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoginRedirect = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  const handleClose = () => {
    setTokenExpiry(null);
    setSessionExpired(null);
  };

  if (sessionExpired) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md animate-pulse">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Session Expired
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {sessionExpired.message}
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleLoginRedirect}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Login Again
                </button>
                <button
                  onClick={handleClose}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 flex-shrink-0"
            >
              <X className="h-5 w-5 text-red-500 hover:text-red-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenExpiry) {
    const isCritical = tokenExpiry.level === 'critical';
    const bgColor = isCritical ? 'bg-orange-50 border-orange-500' : 'bg-yellow-50 border-yellow-500';
    const iconColor = isCritical ? 'text-orange-500' : 'text-yellow-500';
    const titleColor = isCritical ? 'text-orange-800' : 'text-yellow-800';
    const messageColor = isCritical ? 'text-orange-700' : 'text-yellow-700';
    const buttonBg = isCritical ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-600 hover:bg-yellow-700';

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className={`${bgColor} border-l-4 p-4 rounded-lg shadow-lg`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isCritical ? (
                <Clock className={`h-6 w-6 ${iconColor}`} />
              ) : (
                <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${titleColor}`}>
                {isCritical ? 'Session Expiring Soon' : 'Session Warning'}
              </h3>
              <div className={`mt-2 text-sm ${messageColor}`}>
                {tokenExpiry.message}
              </div>
              <div className="mt-3 flex space-x-2">
                {tokenExpiry.actionRequired && (
                  <button
                    onClick={handleRefreshSession}
                    disabled={isRefreshing}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50`}
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Session'
                    )}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 flex-shrink-0"
            >
              <X className={`h-5 w-5 ${iconColor} hover:${iconColor.replace('500', '700')}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
