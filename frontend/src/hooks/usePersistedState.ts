import { useState, useEffect } from 'react';

/**
 * A hook that persists state to localStorage
 * @param key The key to use in localStorage
 * @param initialValue The initial value if no stored value exists
 * @param serializer Optional custom serializer function
 * @param deserializer Optional custom deserializer function
 * @returns [value, setValue, removeValue] tuple
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  serializer?: (value: T) => string,
  deserializer?: (value: string) => T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return deserializer ? deserializer(item) : JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (serializer) {
        window.localStorage.setItem(key, serializer(valueToStore));
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to remove the value from localStorage and reset to initial value
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * A hook for managing boolean values in localStorage
 */
export function usePersistedBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void, () => void] {
  return usePersistedState(key, initialValue);
}

/**
 * A hook for managing string values in localStorage
 */
export function usePersistedString(
  key: string,
  initialValue: string = ''
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  return usePersistedState(key, initialValue);
}

/**
 * A hook for managing number values in localStorage
 */
export function usePersistedNumber(
  key: string,
  initialValue: number = 0
): [number, (value: number | ((prev: number) => number)) => void, () => void] {
  return usePersistedState(key, initialValue);
}

/**
 * A hook for managing object values in localStorage
 */
export function usePersistedObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return usePersistedState(key, initialValue);
}

/**
 * A hook that syncs with localStorage changes across tabs
 */
export function useSyncedPersistedState<T>(
  key: string,
  initialValue: T,
  serializer?: (value: T) => string,
  deserializer?: (value: string) => T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue, removeValue] = usePersistedState(key, initialValue, serializer, deserializer);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserializer ? deserializer(e.newValue) : JSON.parse(e.newValue);
          setValue(newValue);
        } catch (error) {
          console.error(`Error parsing synced localStorage key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // Value was removed in another tab
        setValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserializer]);

  return [value, setValue, removeValue];
}
