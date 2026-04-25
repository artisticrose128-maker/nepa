import { useCallback, useRef, useEffect } from 'react';
import { useError } from './ErrorProvider';

export interface ErrorHandlerOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  enableLogging?: boolean;
  enableReporting?: boolean;
  onError?: (error: Error, context?: any) => void;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    enableRetry = true,
    maxRetries = 3,
    enableLogging = true,
    enableReporting = true,
    onError
  } = options;

  const { addError, removeError, retryError, isOnline } = useError();
  const retryCountRef = useRef<Record<string, number>>({});
  const errorTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleError = useCallback((
    error: Error,
    context?: ErrorContext,
    customMessage?: string
  ) => {
    const errorId = generateErrorId();

    // Log error if enabled
    if (enableLogging) {
      console.error('ErrorHandler caught error:', {
        error,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    // Call custom error handler
    onError?.(error, context);

    // Add error to error provider
    addError({
      id: errorId,
      message: customMessage || error.message,
      type: 'error',
      stack: error.stack,
      component: context?.component,
      userId: context?.userId,
      sessionId: context?.sessionId,
      retryable: enableRetry,
      recoverable: true,
      metadata: context?.metadata
    });

    return errorId;
  }, [addError, enableLogging, onError]);

  const handleAsyncError = useCallback((
    error: Error,
    context?: ErrorContext,
    customMessage?: string
  ) => {
    const errorId = handleError(error, context, customMessage);
    
    // Auto-retry for async operations
    if (enableRetry && context?.action) {
      retryError(errorId);
    }
    
    return errorId;
  }, [handleError, enableRetry, retryError]);

  const retryOperation = useCallback((
    operation: () => Promise<any>,
    context?: ErrorContext
  ): Promise<any> => {
    const contextKey = context?.component || 'unknown';
    const currentRetryCount = retryCountRef.current[contextKey] || 0;

    if (currentRetryCount >= maxRetries) {
      const error = new Error(`Maximum retry attempts (${maxRetries}) exceeded`);
      handleError(error, context);
      return Promise.reject(error);
    }

    retryCountRef.current[contextKey] = currentRetryCount + 1;

    return operation()
      .catch((error) => {
        // Clear retry timeout if exists
        if (errorTimeoutRef.current[contextKey]) {
          clearTimeout(errorTimeoutRef.current[contextKey]);
        }

        // Add delay before retry (exponential backoff)
        const delay = Math.pow(2, currentRetryCount) * 1000; // 1s, 2s, 4s, 8s...

        errorTimeoutRef.current[contextKey] = setTimeout(() => {
          retryOperation(operation, context);
        }, delay);

        handleError(error as Error, context);
        throw error;
      });
  }, [handleError, maxRetries]);

  const clearRetryCount = useCallback((component?: string) => {
    if (component) {
      delete retryCountRef.current[component];
      if (errorTimeoutRef.current[component]) {
        clearTimeout(errorTimeoutRef.current[component]);
        delete errorTimeoutRef.current[component];
      }
    } else {
      retryCountRef.current = {};
      Object.values(errorTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      errorTimeoutRef.current = {};
    }
  }, []);

  const getRetryCount = useCallback((component?: string) => {
    if (component) {
      return retryCountRef.current[component] || 0;
    }
    return Object.values(retryCountRef.current).reduce((sum, count) => sum + count, 0);
  }, []);

  const canRetry = useCallback((component?: string) => {
    const currentRetryCount = getRetryCount(component);
    return enableRetry && currentRetryCount < maxRetries && isOnline;
  }, [enableRetry, maxRetries, getRetryCount, isOnline]);

  const wrapAsyncOperation = useCallback((
    operation: () => Promise<any>,
    context?: ErrorContext
  ) => {
    return retryOperation(operation, context);
  }, [retryOperation]);

  const handleNetworkError = useCallback((
    error: Error,
    context?: ErrorContext
  ) => {
    const networkError = new Error(
      error.message || 'Network error occurred',
      { cause: error, ...context }
    );

    return handleError(networkError, {
      ...context,
      component: 'network'
    });
  }, [handleError]);

  const handleValidationError = useCallback((
    field: string,
    value: any,
    validation: (value: any) => string | null,
    context?: ErrorContext
  ) => {
    const validationResult = validation(value);
    if (validationResult) {
      const error = new Error(validationResult);
      return handleError(error, {
        ...context,
        component: 'validation',
        metadata: { field, value }
      });
    }
    return null;
  }, [handleError]);

  const handleTimeoutError = useCallback((
    timeout: number,
    context?: ErrorContext
  ) => {
    const error = new Error(`Operation timed out after ${timeout}ms`);
    return handleError(error, {
      ...context,
      component: 'timeout'
    });
  }, [handleError]);

  const clearAllErrors = useCallback(() => {
    clearRetryCount();
    // Note: We don't clear the error provider errors here
    // as that should be managed separately
  }, [clearRetryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(errorTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    handleError,
    handleAsyncError,
    retryOperation,
    clearRetryCount,
    getRetryCount,
    canRetry,
    wrapAsyncOperation,
    handleNetworkError,
    handleValidationError,
    handleTimeoutError,
    clearAllErrors
  };
};

// Helper function to generate unique error IDs
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default useErrorHandler;
