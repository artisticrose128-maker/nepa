# State Management Documentation

This document provides an overview of the state management system implemented in the NEPA Platform frontend.

## Overview

The application uses a comprehensive state management system built with React Context and custom hooks. The system is designed to be:

- **Scalable**: Easy to add new state contexts
- **Persistent**: State is automatically saved to localStorage
- **Type-safe**: Full TypeScript support
- **Performant**: Optimized with debouncing and selective updates
- **Maintainable**: Clear separation of concerns

## State Architecture

### Core Contexts

#### 1. GlobalStateContext
**Location**: `src/contexts/GlobalStateContext.tsx`

Manages global application state that persists across sessions:

- **User Preferences**: Language, currency, timezone
- **Application Settings**: Auto-save, notifications, dark mode
- **UI State**: Sidebar collapse state, last visited page
- **Data Cache**: Temporary cached data with expiry
- **Session Data**: Login count, usage time tracking

```typescript
const {
  state,
  setLanguage,
  setCurrency,
  setAutoSaveEnabled,
  setSidebarCollapsed,
  setCachedData,
  getCachedData
} = useGlobalState();
```

#### 2. AuthContext
**Location**: `src/contexts/AuthContext.tsx`

Handles user authentication and authorization:

- User authentication state
- Login/logout functionality
- Profile management
- Token management

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  updateProfile
} = useAuth();
```

#### 3. PaymentContext
**Location**: `src/contexts/PaymentContext.tsx`

Manages payment processing and transaction state:

- Current transaction state
- Payment processing workflow
- Transaction history
- Receipt generation
- Payment method selection

```typescript
const {
  currentTransaction,
  isProcessing,
  processPayment,
  transactionHistory,
  generateReceipt
} = usePayment();
```

#### 4. NotificationContext
**Location**: `src/contexts/NotificationContext.tsx`

Handles global notifications and alerts:

- Notification queue management
- Different notification types (success, error, warning, info)
- Auto-hide functionality
- Notification settings

```typescript
const {
  notifications,
  showSuccess,
  showError,
  showWarning,
  showInfo
} = useNotifications();
```

#### 5. ThemeContext
**Location**: `src/contexts/ThemeContext.tsx`

Manages application theming:

- Theme selection (light, dark, system)
- Theme persistence
- System preference detection

```typescript
const {
  theme,
  resolvedTheme,
  setTheme,
  toggleTheme
} = useTheme();
```

#### 6. KeyboardShortcutContext
**Location**: `src/contexts/KeyboardShortcutContext.tsx`

Manages keyboard shortcuts and accessibility:

- Shortcut registration
- Help system
- Accessibility features

```typescript
const {
  registerShortcut,
  showHelp,
  shortcuts
} = useKeyboardShortcuts();
```

## State Persistence

### localStorage Integration

State is automatically persisted to localStorage using the following strategy:

1. **Automatic Persistence**: State changes are debounced and saved automatically
2. **Selective Persistence**: Only essential state is persisted (cache is excluded)
3. **Error Handling**: Graceful fallbacks when localStorage is unavailable
4. **Cross-tab Sync**: State changes are synchronized across browser tabs

### Storage Keys

All storage keys are prefixed with `nepa-` to avoid conflicts:

```typescript
export const STORAGE_KEYS = {
  GLOBAL_STATE: 'nepa-global-state',
  THEME: 'nepa-theme',
  AUTH_TOKEN: 'nepa-auth-token',
  USER_PREFERENCES: 'nepa-user-preferences',
  PAYMENT_METHOD: 'nepa-payment-method',
  NOTIFICATION_SETTINGS: 'nepa-notification-settings',
  CACHED_DATA_PREFIX: 'nepa-cache-',
} as const;
```

## Custom Hooks

### usePersistedState

A generic hook for persisting state to localStorage:

```typescript
const [value, setValue, removeValue] = usePersistedState(
  'my-key',
  initialValue
);
```

### Specialized Variants

- `usePersistedBoolean()`
- `usePersistedString()`
- `usePersistedNumber()`
- `usePersistedObject()`
- `useSyncedPersistedState()` (cross-tab sync)

## State Utilities

### Cache Management

```typescript
import { createCacheManager } from '../utils/stateUtils';

const cache = createCacheManager(30); // 30 minutes default expiry

cache.set('user-data', userData, 60); // Cache for 60 minutes
const cached = cache.get('user-data');
cache.remove('user-data');
cache.clear(); // Clear all cache
```

### Storage Operations

```typescript
import { 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem,
  clearAllNepaStorage 
} from '../utils/stateUtils';

const data = getStorageItem('key', defaultValue);
setStorageItem('key', data);
removeStorageItem('key');
clearAllNepaStorage(); // Clear all NEPA storage
```

## Best Practices

### 1. Context Usage

- Use the most specific context available
- Don't store everything in GlobalStateContext
- Keep contexts focused on single responsibilities

### 2. Performance

- Use memoization for expensive computations
- Avoid unnecessary re-renders by structuring state properly
- Use the debounced persistence utilities

### 3. Error Handling

- Always handle storage errors gracefully
- Provide fallbacks when localStorage is unavailable
- Validate state before persistence

### 4. Testing

- Mock localStorage in tests
- Test state persistence and recovery
- Test cross-tab synchronization

## Integration Example

```typescript
import React from 'react';
import { 
  GlobalStateProvider,
  AuthProvider,
  PaymentProvider,
  NotificationProvider,
  ThemeProvider,
  KeyboardShortcutProvider 
} from '../contexts';

const App: React.FC = () => {
  return (
    <KeyboardShortcutProvider>
      <GlobalStateProvider>
        <ThemeProvider>
          <AuthProvider>
            <PaymentProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </PaymentProvider>
          </AuthProvider>
        </ThemeProvider>
      </GlobalStateProvider>
    </KeyboardShortcutProvider>
  );
};
```

## Migration Guide

### Adding New State

1. Create a new context in `src/contexts/`
2. Define the state interface and context type
3. Implement the provider component
4. Create custom hooks for easy access
5. Add the provider to the App component
6. Add persistence if needed

### Converting Existing State

1. Identify the state to be managed
2. Choose the appropriate context (or create new)
3. Move state logic to the context
4. Update components to use the context hooks
5. Add persistence if required

## Troubleshooting

### Common Issues

1. **State Not Persisting**: Check localStorage availability and quota
2. **Performance Issues**: Look for excessive re-renders or storage operations
3. **Cross-tab Sync Issues**: Verify storage event listeners are working
4. **Type Errors**: Ensure all interfaces are properly typed

### Debug Tools

Use browser dev tools to inspect:

- localStorage contents
- React DevTools for component state
- Network tab for API calls
- Console for error messages

## Future Enhancements

1. **Redux Integration**: For complex state management needs
2. **IndexedDB**: For larger data storage requirements
3. **State Snapshots**: For debugging and rollback features
4. **Performance Monitoring**: Track state update performance
5. **Automated Testing**: Comprehensive state management tests
