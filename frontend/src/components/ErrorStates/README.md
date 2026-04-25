# Error States System

A comprehensive error handling system for NEPA frontend that provides robust error management, recovery options, and accessibility features.

## 🎯 Overview

The error states system consists of several components that work together to provide a complete error handling solution with proper user feedback, recovery mechanisms, and accessibility compliance.

## 📁 Components

### Core Components

#### `ErrorBoundary.tsx`
React Error Boundary component that catches JavaScript errors in component trees.

**Props:**
- `children`: ReactNode - Child components to wrap
- `fallback`: ReactNode - Custom fallback UI
- `onError`: (error: Error, errorInfo: ErrorInfo) => void - Error callback
- `enableRetry`: boolean - Enable retry functionality
- `maxRetries`: number - Maximum retry attempts
- `showDetails`: boolean - Show technical error details
- `className`: string - Custom CSS classes

**Features:**
- Automatic error catching and reporting
- Retry mechanism with exponential backoff
- Error reporting to monitoring service
- Technical details with component stack
- Accessibility compliance (ARIA labels, screen reader support)

#### `ErrorFallback.tsx`
Flexible error display component with multiple variants.

**Props:**
- `error`: Error - Error object to display
- `resetError`: () => void - Reset error state
- `retry`: () => void - Retry action
- `variant`: 'full' | 'partial' | 'inline' - Display variant
- `showRetry`: boolean - Show retry button
- `showReset`: boolean - Show reset button
- `showDetails`: boolean - Show technical details
- `customMessage`: string - Custom error message
- `className`: string - Custom CSS classes

**Variants:**
- **Full**: Complete error page with support information
- **Partial**: Compact error display for inline use
- **Inline**: Minimal error indicator for forms

#### `ErrorToast.tsx`
Toast notification component for non-critical errors and messages.

**Props:**
- `message`: string - Error message
- `type`: 'error' | 'warning' | 'success' | 'info' - Toast type
- `duration`: number - Auto-dismiss duration (ms)
- `isVisible`: boolean - Whether toast is visible
- `onDismiss`: () => void - Dismiss callback
- `action`: { label: string, onClick: () => void } - Action button
- `showProgress`: boolean - Show progress bar
- `progress`: number - Progress percentage (0-100)
- `className`: string - Custom CSS classes

**Features:**
- Auto-dismiss with timer
- Progress bar support
- Action buttons
- Smooth animations
- Accessibility announcements

#### `ErrorProvider.tsx`
Context provider for global error state management.

**Props:**
- `children`: ReactNode - Child components
- `maxErrors`: number - Maximum concurrent errors
- `maxHistorySize`: number - Error history limit
- `enableRetry`: boolean - Enable retry functionality
- `maxRetries`: number - Maximum retry attempts
- `enableErrorReporting`: boolean - Enable remote error reporting
- `onErrorReport`: (error: ErrorInfo) => void - Custom error reporter

**Context Methods:**
- `addError`: (error: Partial<ErrorInfo>) => void
- `removeError`: (id: string) => void
- `clearErrors`: () => void
- `setGlobalError`: (error: Partial<ErrorInfo>) => void
- `clearGlobalError`: () => void
- `retryError`: (id: string) => void

#### `useErrorHandler.tsx`
Hook for component-level error handling.

**Options:**
- `enableRetry`: boolean - Enable retry functionality
- `maxRetries`: number - Maximum retry attempts
- `enableLogging`: boolean - Enable console logging
- `enableReporting`: boolean - Enable error reporting
- `onError`: (error: Error, context?: ErrorContext) => void - Custom error handler

**Methods:**
- `handleError`: (error: Error, context?: ErrorContext) => string
- `handleAsyncError`: (error: Error, context?: ErrorContext) => string
- `retryOperation`: (operation: () => Promise<any>, context?: ErrorContext) => Promise<any>
- `wrapAsyncOperation`: (operation: () => Promise<any>, context?: ErrorContext) => Promise<any>
- `handleNetworkError`: (error: Error, context?: ErrorContext) => void
- `handleValidationError`: (field: string, value: any, validation: Function, context?: ErrorContext) => string | null
- `handleTimeoutError`: (timeout: number, context?: ErrorContext) => void
- `clearRetryCount`: (component?: string) => void
- `getRetryCount`: (component?: string) => number
- `canRetry`: (component?: string) => boolean

## 🎨 Styling

### `error-states-enhanced.css`
Comprehensive styling for all error components.

**Features:**
- Responsive design (mobile, tablet, desktop)
- Accessibility support (high contrast, reduced motion)
- RTL language support
- Print styles
- Custom scrollbars for error details
- Focus management
- Loading states
- Error severity indicators

## 🌐 Internationalization

### Supported Languages
- English (en)
- Spanish (es)

### Translation Keys
```typescript
error: {
  title: string;
  subtitle: string;
  unknownError: string;
  fallback: {
    title: string;
    subtitle: string;
    unknown: string;
    errorId: string;
    errorName: string;
    errorStack: string;
    technicalDetails: string;
    retry: string;
    reset: string;
    retryAction: string;
    resetAction: string;
    home: string;
    homeAction: string;
    needHelp: string;
    supportText: string;
    contactSupport: string;
    viewFAQ: string;
    faq: string;
  };
  boundary: {
    title: string;
    subtitle: string;
    showDetails: string;
    componentStack: string;
    errorStack: string;
    errorId: string;
    retry: string;
    finalRetry: string;
    reset: string;
    goHome: string;
    support: string;
    contactSupport: string;
  };
  toast: {
    dismiss: string;
    progressLabel: string;
  };
  handler: {
    networkError: string;
    validationError: string;
    timeoutError: string;
    unknownError: string;
  };
}
```

## 🔧 Usage Examples

### Basic Error Boundary

```tsx
import { ErrorBoundary } from './components/ErrorStates';

const MyComponent = () => {
  return (
    <ErrorBoundary
      enableRetry={true}
      maxRetries={3}
      showDetails={true}
      onError={(error, errorInfo) => {
        console.error('Error caught:', error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
};
```

### Error Provider

```tsx
import { ErrorProvider, useError } from './components/ErrorStates';

const App = () => {
  return (
    <ErrorProvider
      maxErrors={10}
      enableErrorReporting={true}
      onErrorReport={(error) => {
        // Send to monitoring service
        analytics.track('error', error);
      }}
    >
      <YourApp />
    </ErrorProvider>
  );
};

const MyComponent = () => {
  const { addError, globalError } = useError();

  const handleApiError = () => {
    addError({
      message: 'API request failed',
      type: 'error',
      component: 'ApiComponent'
    });
  };

  return (
    <div>
      {globalError && (
        <ErrorToast
          message={globalError.message}
          type={globalError.type}
          isVisible={true}
          onDismiss={() => {/* Handle dismiss */}}
        />
      )}
      <button onClick={handleApiError}>
        Trigger API Error
      </button>
    </div>
  );
};
```

### Error Handler Hook

```tsx
import { useErrorHandler } from './components/ErrorStates';

const MyComponent = () => {
  const {
    handleError,
    retryOperation,
    handleValidationError,
    wrapAsyncOperation
  } = useErrorHandler({
    enableRetry: true,
    maxRetries: 3,
    enableLogging: true
  });

  const handleFormSubmit = async (data: FormData) => {
    try {
      // Validate form
      const validationError = handleValidationError('email', data.email, (value) => {
        if (!value || !value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return null;
      });

      if (validationError) {
        return;
      }

      // Submit with retry
      await wrapAsyncOperation(
        () => api.submit(data),
        { component: 'FormSubmit', action: 'API submission' }
      );

    } catch (error) {
      handleError(error, {
        component: 'FormSubmit',
        metadata: { formData: data }
      });
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Custom Error Fallback

```tsx
import { ErrorFallback } from './components/ErrorStates';

const CustomErrorPage = () => {
  const error = new Error('Custom error message');
  
  return (
    <ErrorFallback
      error={error}
      variant="full"
      showRetry={true}
      showDetails={false}
      customMessage="Something went wrong with your request"
      resetError={() => window.location.reload()}
      retry={() => {/* Custom retry logic */}}
    />
  );
};
```

### Error Toast

```tsx
import { ErrorToast } from './components/ErrorStates';

const MyComponent = () => {
  const [toast, setToast] = React.useState({
    message: 'Operation completed successfully',
    type: 'success' as const,
    isVisible: false,
    progress: 0
  });

  const handleApiCall = async () => {
    setToast(prev => ({ ...prev, isVisible: true, progress: 50 }));
    
    try {
      await api.someOperation();
      setToast({
        message: 'Operation completed successfully',
        type: 'success',
        isVisible: true,
        progress: 100
      });
    } catch (error) {
      setToast({
        message: 'Operation failed',
        type: 'error',
        isVisible: true,
        progress: 0
      });
    }
  };

  return (
    <div>
      <button onClick={handleApiCall}>
        Start Operation
      </button>
      
      <ErrorToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={() => setToast(prev => ({ ...prev, isVisible: false }))}
        showProgress={toast.progress > 0 && toast.progress < 100}
        progress={toast.progress}
        action={toast.type === 'error' ? {
          label: 'Retry',
          onClick: handleApiCall
        } : undefined}
      />
    </div>
  );
};
```

## ♿ Accessibility Features

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard support for all error UI
- **Screen Reader**: ARIA labels, roles, and live regions
- **Focus Management**: Proper focus handling and restoration
- **Color Contrast**: High contrast mode support
- **Reduced Motion**: Animation respect for motion preferences

### ARIA Attributes
- `role="alert"`: For critical error announcements
- `role="status"`: For non-critical messages
- `aria-live="polite"`: For non-urgent messages
- `aria-live="assertive"`: For urgent messages
- `aria-atomic="true"`: For complete message announcements
- `aria-label`: Descriptive labels for all interactive elements
- `aria-expanded`: For dropdown states
- `aria-haspopup`: For dropdown menus

### Keyboard Support
- **Tab**: Navigate through error elements
- **Enter/Space**: Activate buttons and actions
- **Escape**: Close modals and dismiss errors
- **Arrow Keys**: Navigate dropdown menus
- **Focus Management**: Proper focus trapping in modals

## 🔍 Testing

### Test Coverage
- **Component Tests**: All error components
- **Accessibility Tests**: axe-jest integration
- **Integration Tests**: Error flow testing
- **User Interaction Tests**: Click, keyboard, navigation
- **Error Simulation**: Various error scenarios

### Running Tests
```bash
# Run error state tests
npm test -- --testPathPattern=ErrorStates

# Run accessibility tests
npm run test:accessibility

# Run all tests
npm test
```

## 🔧 Configuration

### Error Information Structure
```typescript
interface ErrorInfo {
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
```

### Error Context Structure
```typescript
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}
```

## 🚀 Performance

### Optimization
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Error details loaded on demand
- **Efficient CSS**: Hardware-accelerated animations
- **Bundle Size**: Tree-shaking friendly exports
- **Memory Management**: Automatic cleanup on unmount

### Metrics
- **Bundle Impact**: ~12KB (gzipped)
- **Runtime Cost**: Minimal
- **Memory Usage**: Low

## 🔄 Error Recovery Strategies

### Automatic Retry
- **Exponential Backoff**: 1s, 2s, 4s, 8s delays
- **Maximum Attempts**: Configurable limit (default: 3)
- **Network Awareness**: Online/offline status checking
- **Component Isolation**: Per-component retry counters

### User Actions
- **Retry Button**: Manual retry with attempt counter
- **Reset Button**: Clear error state and restart
- **Home Button**: Navigate to safe page
- **Support Contact**: Direct access to help resources
- **Technical Details**: Expandable error information

### Error Reporting
- **Automatic**: Errors sent to monitoring service
- **Structured Data**: Complete error context and metadata
- **User Agent**: Browser and device information
- **Session Tracking**: User session and flow context

## 📚 Best Practices

### Error Handling
1. **Catch Early**: Handle errors at source
2. **Provide Context**: Include relevant metadata
3. **Offer Recovery**: Give users clear next steps
4. **Be Specific**: Use descriptive error messages
5. **Log Everything**: Maintain comprehensive error logs

### User Experience
1. **Don't Blame**: User-friendly error messages
2. **Provide Options**: Multiple recovery paths
3. **Maintain State**: Preserve user data when possible
4. **Communicate Clearly**: Explain what happened and what to do
5. **Respect Preferences**: Honor accessibility and motion settings

### Development
1. **Test Scenarios**: Cover all error cases
2. **Monitor Production**: Track error rates and patterns
3. **Document Everything**: Clear error handling documentation
4. **Review Regularly**: Update error handling as needed
5. **User Feedback**: Collect and act on user reports

## 🐛 Troubleshooting

### Common Issues

#### Errors Not Showing
1. Check ErrorProvider wraps your component
2. Verify error reporting is enabled
3. Ensure error context is properly structured
4. Check CSS for error display styles

#### Retry Not Working
1. Verify enableRetry is true
2. Check maxRetries configuration
3. Ensure network status is monitored
4. Validate retry logic implementation

#### Accessibility Issues
1. Verify ARIA labels are present
2. Check keyboard navigation works
3. Test with screen readers
4. Validate color contrast ratios

#### Performance Issues
1. Check for excessive re-renders
2. Monitor memory usage
3. Optimize error reporting frequency
4. Review bundle size impact

## 🔄 Future Enhancements

### Planned Features
- **Error Analytics**: Advanced error tracking and analysis
- **Smart Recovery**: AI-powered error resolution suggestions
- **Offline Support**: Enhanced offline error handling
- **Custom Themes**: More styling options
- **Error Patterns**: Predefined error types and handlers

### Integration Opportunities
- **Monitoring Services**: Sentry, LogRocket integration
- **Analytics**: Error rate tracking and reporting
- **Support Systems**: Zendesk, Intercom integration
- **CI/CD**: Automated error testing in pipelines

---

This error states system provides comprehensive, accessible, and user-friendly error handling for NEPA platform, ensuring users get proper feedback and recovery options when things go wrong.
