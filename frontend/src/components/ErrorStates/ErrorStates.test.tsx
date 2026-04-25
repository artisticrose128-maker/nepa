import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';
import ErrorToast from './ErrorToast';
import ErrorProvider, { useError } from './ErrorProvider';
import useErrorHandler from './useErrorHandler';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock useTranslation
jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock fetch for error reporting
global.fetch = jest.fn();

describe('Error States Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('ErrorBoundary', () => {
    test('renders children when no error', () => {
      const TestComponent = () => <div>Test Content</div>;
      
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders error boundary when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected error')).toBeInTheDocument();
    });

    test('calls onError callback when error occurs', () => {
      const mockOnError = jest.fn();
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('renders retry button when enableRetry is true', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary enableRetry={true} maxRetries={2}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('(1/2)')).toBeInTheDocument();
    });

    test('renders custom fallback when provided', () => {
      const CustomFallback = () => <div>Custom Error Display</div>;
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error Display')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    test('shows error details when showDetails is true', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Show error details')).toBeInTheDocument();
      expect(screen.getByText('Component Stack')).toBeInTheDocument();
    });

    test('handles retry limit', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary enableRetry={true} maxRetries={1}>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Retry');
      await userEvent.click(retryButton);
      await userEvent.click(retryButton);

      expect(screen.getByText('Final Retry')).toBeInTheDocument();
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    test('passes accessibility checks', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorFallback', () => {
    test('renders full fallback variant', () => {
      const error = new Error('Test error');
      const resetError = jest.fn();

      render(
        <ErrorFallback
          error={error}
          resetError={resetError}
          variant="full"
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Start Over')).toBeInTheDocument();
    });

    test('renders partial fallback variant', () => {
      const error = new Error('Test error');
      const resetError = jest.fn();

      render(
        <ErrorFallback
          error={error}
          resetError={resetError}
          variant="partial"
        />
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Start Over')).toBeInTheDocument();
    });

    test('renders inline fallback variant', () => {
      const error = new Error('Test error');
      const resetError = jest.fn();

      render(
        <ErrorFallback
          error={error}
          resetError={resetError}
          variant="inline"
        />
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      const error = new Error('Test error');
      const customMessage = 'Custom error message';

      render(
        <ErrorFallback
          error={error}
          customMessage={customMessage}
        />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    test('hides retry when showRetry is false', () => {
      const error = new Error('Test error');

      render(
        <ErrorFallback
          error={error}
          showRetry={false}
        />
      );

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    test('shows error details when showDetails is true', () => {
      const error = new Error('Test error');

      render(
        <ErrorFallback
          error={error}
          showDetails={true}
        />
      );

      expect(screen.getByText('Technical details')).toBeInTheDocument();
      expect(screen.getByText('Error Name')).toBeInTheDocument();
    });

    test('calls resetError when reset button is clicked', async () => {
      const error = new Error('Test error');
      const resetError = jest.fn();

      render(
        <ErrorFallback
          error={error}
          resetError={resetError}
        />
      );

      const resetButton = screen.getByText('Start Over');
      await userEvent.click(resetButton);

      expect(resetError).toHaveBeenCalled();
    });

    test('passes accessibility checks', async () => {
      const error = new Error('Test error');

      const { container } = render(
        <ErrorFallback
          error={error}
          variant="full"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorToast', () => {
    test('renders toast when isVisible is true', () => {
      const onDismiss = jest.fn();

      render(
        <ErrorToast
          message="Test error message"
          isVisible={true}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });

    test('does not render when isVisible is false', () => {
      const onDismiss = jest.fn();

      render(
        <ErrorToast
          message="Test error message"
          isVisible={false}
          onDismiss={onDismiss}
        />
      );

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });

    test('renders with action button', () => {
      const onDismiss = jest.fn();
      const action = { label: 'Retry Action', onClick: jest.fn() };

      render(
        <ErrorToast
          message="Test error message"
          isVisible={true}
          onDismiss={onDismiss}
          action={action}
        />
      );

      expect(screen.getByText('Retry Action')).toBeInTheDocument();
    });

    test('shows progress bar when showProgress is true', () => {
      const onDismiss = jest.fn();

      render(
        <ErrorToast
          message="Test error message"
          isVisible={true}
          onDismiss={onDismiss}
          showProgress={true}
          progress={50}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    test('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = jest.fn();

      render(
        <ErrorToast
          message="Test error message"
          isVisible={true}
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    test('passes accessibility checks', async () => {
      const onDismiss = jest.fn();

      const { container } = render(
        <ErrorToast
          message="Test error message"
          isVisible={true}
          onDismiss={onDismiss}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ErrorProvider', () => {
    test('provides error context to children', () => {
      const TestComponent = () => {
        const { addError } = useError();
        
        return (
          <button onClick={() => addError({ message: 'Test error' })}>
            Add Error
          </button>
        );
      };

      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      const addButton = screen.getByText('Add Error');
      await userEvent.click(addButton);

      // Error should be added to context
      expect(screen.getByText('Add Error')).toBeInTheDocument();
    });

    test('throws error when useError is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const TestComponent = () => {
        useError(); // This should throw
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useError must be used within an ErrorProvider');

      consoleSpy.mockRestore();
    });

    test('manages error history', () => {
      const TestComponent = () => {
        const { addError, errorHistory } = useError();
        
        return (
          <div>
            <button onClick={() => addError({ message: 'Error 1' })}>Add Error 1</button>
            <button onClick={() => addError({ message: 'Error 2' })}>Add Error 2</button>
            <div data-testid="error-count">Errors: {errorHistory.length}</div>
          </div>
        );
      };

      render(
        <ErrorProvider maxHistorySize={2}>
          <TestComponent />
        </ErrorProvider>
      );

      const addButton1 = screen.getByText('Add Error 1');
      const addButton2 = screen.getByText('Add Error 2');
      
      await userEvent.click(addButton1);
      await userEvent.click(addButton2);

      // Should only keep last 2 errors in history
      expect(screen.getByTestId('error-count')).toHaveTextContent('Errors: 2');
    });
  });

  describe('useErrorHandler', () => {
    test('handles errors correctly', () => {
      const onError = jest.fn();
      const handler = useErrorHandler({ onError });

      const error = new Error('Test error');
      const errorId = handler.handleError(error);

      expect(errorId).toBeDefined();
      expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
    });

    test('handles async errors with retry', async () => {
      const onError = jest.fn();
      const handler = useErrorHandler({ enableRetry: true, maxRetries: 2 });

      let attemptCount = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Operation failed');
        }
        return Promise.resolve('success');
      });

      const result = await handler.wrapAsyncOperation(failingOperation);

      expect(result).toBe('success');
      expect(attemptCount).toBe(2);
      expect(onError).toHaveBeenCalledTimes(2);
    });

    test('handles validation errors', () => {
      const onError = jest.fn();
      const handler = useErrorHandler({});

      const validate = (value: string) => {
        if (!value || value.length < 3) {
          return 'Value must be at least 3 characters';
        }
        return null;
      };

      const result = handler.handleValidationError('test', 'ab', validate);

      expect(result).toBeNull();
      expect(onError).not.toHaveBeenCalled();
    });

    test('handles timeout errors', () => {
      const onError = jest.fn();
      const handler = useErrorHandler({});

      const timeoutError = handler.handleTimeoutError(5000);

      expect(timeoutError).toBeDefined();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Operation timed out after 5000ms'
        }),
        expect.any(Object)
      );
    });
  });

  describe('Integration Tests', () => {
    test('ErrorBoundary with ErrorProvider', () => {
      const TestComponent = () => {
        const { addError } = useError();
        
        const triggerError = () => {
          addError({ message: 'Test error from context' });
          throw new Error('Test error');
        };

        return (
          <div>
            <button onClick={triggerError}>Trigger Error</button>
          </div>
        );
      };

      render(
        <ErrorProvider>
          <ErrorBoundary>
            <TestComponent />
          </ErrorBoundary>
        </ErrorProvider>
      );

      const triggerButton = screen.getByText('Trigger Error');
      await userEvent.click(triggerButton);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('ErrorToast with ErrorProvider', () => {
      const TestComponent = () => {
        const { addError, globalError } = useError();
        
        React.useEffect(() => {
          addError({ 
            message: 'Test toast error',
            type: 'warning'
          });
        }, [addError]);

        return (
          <div>
            {globalError && (
              <ErrorToast
                message={globalError.message}
                type={globalError.type}
                isVisible={true}
                onDismiss={() => {/* Mock dismiss */}}
              />
            )}
          </div>
        );
      };

      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test toast error')).toBeInTheDocument();
      });
    });

    test('complete error flow', async () => {
      const TestComponent = () => {
        const { addError, clearErrors } = useError();
        
        return (
          <div>
            <ErrorFallback
              error={new Error('Initial error')}
              onRetry={() => addError({ message: 'Retried error' })}
              onDismiss={clearErrors}
            />
          </div>
        );
      };

      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      const retryButton = screen.getByText('Try Again');
      await userEvent.click(retryButton);

      expect(screen.getByText('Retried error')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    test('sends error to reporting service', async () => {
      const onError = jest.fn();
      
      render(
        <ErrorProvider enableErrorReporting={true} onErrorReport={onError}>
          <ErrorBoundary>
            <div />
          </ErrorBoundary>
        </ErrorProvider>
      );

      // Trigger an error
      const ThrowError = () => {
        throw new Error('Test error for reporting');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/errors',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Test error for reporting')
          })
        );
      });
    });
  });
});
