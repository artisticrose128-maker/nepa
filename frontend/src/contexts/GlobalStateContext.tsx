import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Global application state interface
interface GlobalState {
  // User preferences
  language: string;
  currency: string;
  timezone: string;
  
  // Application settings
  autoSaveEnabled: boolean;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  
  // UI state
  sidebarCollapsed: boolean;
  lastVisitedPage: string;
  
  // Data cache
  cachedData: {
    [key: string]: {
      data: any;
      timestamp: number;
      expiry: number;
    };
  };
  
  // User session data
  sessionData: {
    loginCount: number;
    lastLoginAt: string | null;
    totalUsageTime: number; // in minutes
  };
}

interface GlobalStateContextType {
  state: GlobalState;
  
  // State update functions
  updateState: (updates: Partial<GlobalState>) => void;
  resetState: () => void;
  
  // Preference setters
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  setTimezone: (timezone: string) => void;
  
  // Settings setters
  setAutoSaveEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkModeEnabled: (enabled: boolean) => void;
  
  // UI state setters
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLastVisitedPage: (page: string) => void;
  
  // Cache management
  setCachedData: (key: string, data: any, expiryInMinutes?: number) => void;
  getCachedData: (key: string) => any | null;
  clearCachedData: (key?: string) => void;
  
  // Session management
  incrementLoginCount: () => void;
  updateUsageTime: (minutes: number) => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

const defaultState: GlobalState = {
  language: 'en',
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  
  autoSaveEnabled: true,
  notificationsEnabled: true,
  darkModeEnabled: false,
  
  sidebarCollapsed: false,
  lastVisitedPage: '/',
  
  cachedData: {},
  
  sessionData: {
    loginCount: 0,
    lastLoginAt: null,
    totalUsageTime: 0,
  },
};

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Auto-save state to localStorage when it changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveToStorage();
    }, 1000); // Debounce saves to avoid excessive writes

    return () => clearTimeout(debounceTimer);
  }, [state]);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setState(prevState => {
        const now = Date.now();
        const cleanedCache = { ...prevState.cachedData };
        
        Object.keys(cleanedCache).forEach(key => {
          if (cleanedCache[key].timestamp + cleanedCache[key].expiry < now) {
            delete cleanedCache[key];
          }
        });
        
        return {
          ...prevState,
          cachedData: cleanedCache,
        };
      });
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  const updateState = (updates: Partial<GlobalState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
    clearStorage();
  };

  // Preference setters
  const setLanguage = (language: string) => {
    updateState({ language });
  };

  const setCurrency = (currency: string) => {
    updateState({ currency });
  };

  const setTimezone = (timezone: string) => {
    updateState({ timezone });
  };

  // Settings setters
  const setAutoSaveEnabled = (enabled: boolean) => {
    updateState({ autoSaveEnabled: enabled });
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    updateState({ notificationsEnabled: enabled });
  };

  const setDarkModeEnabled = (enabled: boolean) => {
    updateState({ darkModeEnabled: enabled });
  };

  // UI state setters
  const setSidebarCollapsed = (collapsed: boolean) => {
    updateState({ sidebarCollapsed: collapsed });
  };

  const setLastVisitedPage = (page: string) => {
    updateState({ lastVisitedPage: page });
  };

  // Cache management
  const setCachedData = (key: string, data: any, expiryInMinutes: number = 30) => {
    const now = Date.now();
    const expiry = expiryInMinutes * 60 * 1000; // Convert to milliseconds
    
    setState(prevState => ({
      ...prevState,
      cachedData: {
        ...prevState.cachedData,
        [key]: {
          data,
          timestamp: now,
          expiry,
        },
      },
    }));
  };

  const getCachedData = (key: string): any | null => {
    const cached = state.cachedData[key];
    if (!cached) return null;
    
    const now = Date.now();
    if (cached.timestamp + cached.expiry < now) {
      // Expired, remove it
      setState(prevState => {
        const newCache = { ...prevState.cachedData };
        delete newCache[key];
        return { ...prevState, cachedData: newCache };
      });
      return null;
    }
    
    return cached.data;
  };

  const clearCachedData = (key?: string) => {
    if (key) {
      setState(prevState => {
        const newCache = { ...prevState.cachedData };
        delete newCache[key];
        return { ...prevState, cachedData: newCache };
      });
    } else {
      updateState({ cachedData: {} });
    }
  };

  // Session management
  const incrementLoginCount = () => {
    setState(prevState => ({
      ...prevState,
      sessionData: {
        ...prevState.sessionData,
        loginCount: prevState.sessionData.loginCount + 1,
        lastLoginAt: new Date().toISOString(),
      },
    }));
  };

  const updateUsageTime = (minutes: number) => {
    setState(prevState => ({
      ...prevState,
      sessionData: {
        ...prevState.sessionData,
        totalUsageTime: prevState.sessionData.totalUsageTime + minutes,
      },
    }));
  };

  // Persistence functions
  const saveToStorage = () => {
    try {
      const stateToSave = {
        ...state,
        // Don't save temporary cache data
        cachedData: {},
      };
      localStorage.setItem('nepa-global-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save global state to localStorage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const savedState = localStorage.getItem('nepa-global-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(prevState => ({
          ...defaultState,
          ...parsed,
          // Restore empty cache object
          cachedData: {},
        }));
      }
    } catch (error) {
      console.error('Failed to load global state from localStorage:', error);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem('nepa-global-state');
    } catch (error) {
      console.error('Failed to clear global state from localStorage:', error);
    }
  };

  const value: GlobalStateContextType = {
    state,
    updateState,
    resetState,
    setLanguage,
    setCurrency,
    setTimezone,
    setAutoSaveEnabled,
    setNotificationsEnabled,
    setDarkModeEnabled,
    setSidebarCollapsed,
    setLastVisitedPage,
    setCachedData,
    getCachedData,
    clearCachedData,
    incrementLoginCount,
    updateUsageTime,
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
