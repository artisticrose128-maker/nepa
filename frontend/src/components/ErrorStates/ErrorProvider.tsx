import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { ErrorToast } from './ErrorToast';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  component?: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  retryable?: boolean;
  recoverable?: boolean;
}

export interface ErrorProviderState {
  errors: ErrorInfo[];
  globalError: ErrorInfo | null;
  isOnline: boolean;
  retryCount: Record<string, number>;
  errorHistory: ErrorInfo[];
}

export interface ErrorProviderContext {
  errors: ErrorInfo[];
  globalError: ErrorInfo | null;
  addError: (error: Partial<ErrorInfo>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: Partial<ErrorInfo>) => void;
  clearGlobalError: () => void;
  retryError: (id: string) => void;
  isOnline: boolean;
  errorHistory: ErrorInfo[];
}

const ErrorContext = createContext<ErrorProviderContext | undefined>(undefined);

export interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  maxHistorySize?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  enableErrorReporting?: boolean;
  onErrorReport?: (error: ErrorInfo) => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxErrors = 10,
  maxHistorySize = 100,
  enableRetry = true,
  maxRetries = 3,
  enableErrorReporting = true,
  onErrorReport
}) => {
  const [state, setState] = useState<ErrorProviderState>({
    errors: [],
    globalError: null,
    isOnline: navigator.onLine,
    retryCount: {},
    errorHistory: []
  });

  // Generate unique error ID
  const generateErrorId = useCallback((): string => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add error to the system
  const addError = useCallback((errorData: Partial<ErrorInfo>) => {
    const error: ErrorInfo = {
      id: generateErrorId(),
      message: errorData.message || 'Unknown error occurred',
      type: errorData.type || 'error',
      timestamp: new Date(),
      component: errorData.component,
      stack: errorData.stack,
      userId: errorData.userId,
      sessionId: errorData.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryable: errorData.retryable ?? true,
      recoverable: errorData.recoverable ?? true,
      ...errorData
    };

    setState(prevState => {
      const newErrors = [...prevState.errors, error].slice(-maxErrors);
      const newHistory = [...prevState.errorHistory, error].slice(-maxHistorySize);
      
      return {
        ...prevState,
        errors: newErrors,
        errorHistory: newHistory
      };
    });

    // Report error if enabled
    if (enableErrorReporting) {
      reportError(error);
    }

    // Call custom error reporter
    onErrorReport?.(error);
  }, [generateErrorId, maxErrors, maxHistorySize, enableErrorReporting, onErrorReport]);

  // Remove error from the system
  const removeError = useCallback((id: string) => {
    setState(prevState => ({
      ...prevState,
      errors: prevState.errors.filter(error => error.id !== id)
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      errors: []
    }));
  }, []);

  // Set global error
  const setGlobalError = useCallback((errorData: Partial<ErrorInfo>) => {
    const error: ErrorInfo = {
      id: generateErrorId(),
      message: errorData.message || 'Unknown error occurred',
      type: errorData.type || 'error',
      timestamp: new Date(),
      component: errorData.component,
      stack: errorData.stack,
      userId: errorData.userId,
      sessionId: errorData.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryable: errorData.retryable ?? true,
      recoverable: errorData.recoverable ?? true,
      ...errorData
    };

    setState(prevState => ({
      ...prevState,
      globalError: error,
      errorHistory: [...prevState.errorHistory, error].slice(-maxHistorySize)
    }));

    // Report error if enabled
    if (enableErrorReporting) {
      reportError(error);
    }

    // Call custom error reporter
    onErrorReport?.(error);
  }, [generateErrorId, maxHistorySize, enableErrorReporting, onErrorReport]);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      globalError: null
    }));
  }, []);

  // Retry an error
  const retryError = useCallback((id: string) => {
    if (!enableRetry) return;

    setState(prevState => {
      const currentRetryCount = prevState.retryCount[id] || 0;
      
      if (currentRetryCount >= maxRetries) {
        return prevState; // Max retries reached
      }

      return {
        ...prevState,
        retryCount: {
          ...prevState.retryCount,
          [id]: currentRetryCount + 1
        }
      };
    });
  }, [enableRetry, maxRetries]);

  // Report error to monitoring service
  const reportError = useCallback((error: ErrorInfo) => {
    try {
      // Send to error reporting service
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'X-Error-ID': error.id
        },
        body: JSON.stringify({
          error,
          context: {
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
  }, []);

  // Handle online/offline status
  const handleOnline = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOnline: true
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isOnline: false
    }));
  }, []);

  // Setup network status listeners
  React.useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const contextValue: ErrorProviderContext = {
    errors: state.errors,
    globalError: state.globalError,
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    clearGlobalError,
    retryError,
    isOnline: state.isOnline,
    errorHistory: state.errorHistory
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorProviderContext => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorProvider;
