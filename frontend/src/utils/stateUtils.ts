/**
 * Utility functions for state management
 */

// Storage keys
export const STORAGE_KEYS = {
  GLOBAL_STATE: 'nepa-global-state',
  THEME: 'nepa-theme',
  AUTH_TOKEN: 'nepa-auth-token',
  USER_PREFERENCES: 'nepa-user-preferences',
  PAYMENT_METHOD: 'nepa-payment-method',
  NOTIFICATION_SETTINGS: 'nepa-notification-settings',
  CACHED_DATA_PREFIX: 'nepa-cache-',
} as const;

/**
 * Safely get an item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue ?? null;
  }
}

/**
 * Safely set an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all NEPA-related storage items
 */
export function clearAllNepaStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.CACHED_DATA_PREFIX) {
      removeStorageItem(key);
    }
  });

  // Clear cached data items
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.CACHED_DATA_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Debounced function to prevent excessive localStorage writes
 */
export function createDebouncedStorageWriter<T>(
  key: string,
  delay: number = 1000
): (value: T) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (value: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setStorageItem(key, value);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Create a cache manager with automatic expiry
 */
export function createCacheManager(defaultExpiryMinutes: number = 30) {
  const set = (key: string, data: any, expiryMinutes?: number) => {
    const expiry = (expiryMinutes ?? defaultExpiryMinutes) * 60 * 1000;
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA_PREFIX}${key}`;
    
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry,
    };

    setStorageItem(cacheKey, cacheData);
  };

  const get = (key: string): any | null => {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA_PREFIX}${key}`;
    const cached = getStorageItem(cacheKey);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (cached.timestamp + cached.expiry < now) {
      // Expired, remove it
      removeStorageItem(cacheKey);
      return null;
    }

    return cached.data;
  };

  const remove = (key: string) => {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA_PREFIX}${key}`;
    removeStorageItem(cacheKey);
  };

  const clear = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.CACHED_DATA_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  };

  const cleanup = () => {
    const now = Date.now();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.CACHED_DATA_PREFIX)) {
        const cached = getStorageItem(key);
        if (cached && cached.timestamp + cached.expiry < now) {
          localStorage.removeItem(key);
        }
      }
    }
  };

  return {
    set,
    get,
    remove,
    clear,
    cleanup,
  };
}

/**
 * Validate and sanitize state data
 */
export function validateStateData<T>(
  data: any,
  schema: Record<string, (value: any) => boolean>
): T | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const sanitized: any = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    if (key in data && validator(data[key])) {
      sanitized[key] = data[key];
    }
  }

  return sanitized as T;
}

/**
 * Create a state validator
 */
export function createStateValidator<T>(schema: {
  [K in keyof T]: (value: any) => boolean;
}) {
  return (data: any): data is T => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    return Object.entries(schema).every(([key, validator]) => {
      return key in data && validator(data[key]);
    });
  };
}

/**
 * Merge state updates safely
 */
export function mergeStateUpdates<T extends Record<string, any>>(
  currentState: T,
  updates: Partial<T>
): T {
  return {
    ...currentState,
    ...updates,
  };
}

/**
 * Create a state snapshot for debugging
 */
export function createStateSnapshot(state: any, label?: string): void {
  const snapshot = {
    label: label || new Date().toISOString(),
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(state)), // Deep clone
  };

  console.group(`State Snapshot: ${snapshot.label}`);
  console.log('Timestamp:', new Date(snapshot.timestamp));
  console.log('State:', snapshot.state);
  console.groupEnd();
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
  nepaUsed: number;
} {
  let total = 0;
  let nepaTotal = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        const size = (key.length + value.length) * 2; // UTF-16 characters
        total += size;
        
        if (key.startsWith('nepa-')) {
          nepaTotal += size;
        }
      }
    }
  }

  // Estimate 5MB limit (typical localStorage limit)
  const available = 5 * 1024 * 1024;
  const percentage = (total / available) * 100;

  return {
    used: total,
    available,
    percentage,
    nepaUsed: nepaTotal,
  };
}
