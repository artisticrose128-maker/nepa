import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  field: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'daterange' | 'boolean';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterValue {
  [key: string]: any;
}

export interface FilterState {
  values: FilterValue;
  activeFilters: string[];
  isDirty: boolean;
  lastApplied: FilterValue;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: FilterValue;
  isDefault?: boolean;
}

export interface FilterAnalytics {
  totalApplications: number;
  mostUsedFilters: Array<{ filterId: string; count: number }>;
  filterCombinations: Array<{ combination: string; count: number }>;
  averageFiltersPerApplication: number;
  resetCount: number;
  presetUsage: Array<{ presetId: string; count: number }>;
}

interface FilterContextType {
  // State
  availableFilters: FilterOption[];
  filterState: FilterState;
  presets: FilterPreset[];
  analytics: FilterAnalytics;
  
  // Actions
  setAvailableFilters: (filters: FilterOption[]) => void;
  updateFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  applyFilters: () => void;
  hasActiveFilters: () => boolean;
  getFilterCount: () => number;
  
  // Presets
  savePreset: (name: string, description?: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, name: string, description?: string) => void;
  
  // Analytics
  trackFilterApplication: () => void;
  trackFilterReset: () => void;
  trackPresetUsage: (presetId: string) => void;
  getAnalytics: () => FilterAnalytics;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  defaultFilters?: FilterOption[];
  enablePersistence?: boolean;
  enableAnalytics?: boolean;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  defaultFilters = [],
  enablePersistence = true,
  enableAnalytics = true
}) => {
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>(defaultFilters);
  const [filterState, setFilterState] = useState<FilterState>({
    values: {},
    activeFilters: [],
    isDirty: false,
    lastApplied: {}
  });
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [analytics, setAnalytics] = useState<FilterAnalytics>({
    totalApplications: 0,
    mostUsedFilters: [],
    filterCombinations: [],
    averageFiltersPerApplication: 0,
    resetCount: 0,
    presetUsage: []
  });

  // Load data from localStorage on mount
  useEffect(() => {
    if (enablePersistence) {
      loadFromLocalStorage();
    }
  }, [enablePersistence]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (enablePersistence && filterState.isDirty) {
      saveToLocalStorage();
    }
  }, [filterState, enablePersistence]);

  // Update filter value
  const updateFilter = (filterId: string, value: any) => {
    setFilterState(prev => {
      const newValues = { ...prev.values, [filterId]: value };
      const activeFilters = Object.keys(newValues).filter(key => 
        newValues[key] !== '' && newValues[key] !== null && newValues[key] !== undefined
      );

      return {
        ...prev,
        values: newValues,
        activeFilters,
        isDirty: true
      };
    });
  };

  // Remove filter
  const removeFilter = (filterId: string) => {
    setFilterState(prev => {
      const newValues = { ...prev.values };
      delete newValues[filterId];
      const activeFilters = Object.keys(newValues).filter(key => 
        newValues[key] !== '' && newValues[key] !== null && newValues[key] !== undefined
      );

      return {
        ...prev,
        values: newValues,
        activeFilters,
        isDirty: true
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState(prev => ({
      ...prev,
      values: {},
      activeFilters: [],
      isDirty: true
    }));
  };

  // Reset to last applied filters
  const resetFilters = () => {
    setFilterState(prev => ({
      ...prev,
      values: { ...prev.lastApplied },
      activeFilters: Object.keys(prev.lastApplied).filter(key => 
        prev.lastApplied[key] !== '' && prev.lastApplied[key] !== null && prev.lastApplied[key] !== undefined
      ),
      isDirty: true
    }));
    
    if (enableAnalytics) {
      trackFilterReset();
    }
  };

  // Apply filters
  const applyFilters = () => {
    setFilterState(prev => ({
      ...prev,
      lastApplied: { ...prev.values },
      isDirty: false
    }));
    
    if (enableAnalytics) {
      trackFilterApplication();
    }
  };

  // Check if there are active filters
  const hasActiveFilters = (): boolean => {
    return filterState.activeFilters.length > 0;
  };

  // Get active filter count
  const getFilterCount = (): number => {
    return filterState.activeFilters.length;
  };

  // Save preset
  const savePreset = (name: string, description?: string) => {
    const preset: FilterPreset = {
      id: Date.now().toString(),
      name,
      description,
      filters: { ...filterState.values }
    };

    setPresets(prev => [...prev, preset]);
    
    if (enablePersistence) {
      saveToLocalStorage();
    }
  };

  // Load preset
  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFilterState(prev => ({
        ...prev,
        values: { ...preset.filters },
        activeFilters: Object.keys(preset.filters).filter(key => 
          preset.filters[key] !== '' && preset.filters[key] !== null && preset.filters[key] !== undefined
        ),
        isDirty: true
      }));
      
      if (enableAnalytics) {
        trackPresetUsage(presetId);
      }
    }
  };

  // Delete preset
  const deletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    
    if (enablePersistence) {
      saveToLocalStorage();
    }
  };

  // Update preset
  const updatePreset = (presetId: string, name: string, description?: string) => {
    setPresets(prev => prev.map(p => 
      p.id === presetId ? { ...p, name, description } : p
    ));
    
    if (enablePersistence) {
      saveToLocalStorage();
    }
  };

  // Track filter application
  const trackFilterApplication = () => {
    setAnalytics(prev => {
      const newAnalytics = { ...prev };
      newAnalytics.totalApplications += 1;

      // Update most used filters
      filterState.activeFilters.forEach(filterId => {
        const existingIndex = newAnalytics.mostUsedFilters.findIndex(f => f.filterId === filterId);
        if (existingIndex >= 0) {
          newAnalytics.mostUsedFilters[existingIndex].count += 1;
        } else {
          newAnalytics.mostUsedFilters.push({ filterId, count: 1 });
        }
      });
      newAnalytics.mostUsedFilters.sort((a, b) => b.count - a.count);
      newAnalytics.mostUsedFilters = newAnalytics.mostUsedFilters.slice(0, 10);

      // Update filter combinations
      const combination = filterState.activeFilters.sort().join(',');
      const existingComboIndex = newAnalytics.filterCombinations.findIndex(c => c.combination === combination);
      if (existingComboIndex >= 0) {
        newAnalytics.filterCombinations[existingComboIndex].count += 1;
      } else {
        newAnalytics.filterCombinations.push({ combination, count: 1 });
      }
      newAnalytics.filterCombinations.sort((a, b) => b.count - a.count);
      newAnalytics.filterCombinations = newAnalytics.filterCombinations.slice(0, 10);

      // Update average filters per application
      const totalFilters = newAnalytics.averageFiltersPerApplication * (newAnalytics.totalApplications - 1) + filterState.activeFilters.length;
      newAnalytics.averageFiltersPerApplication = totalFilters / newAnalytics.totalApplications;

      return newAnalytics;
    });
  };

  // Track filter reset
  const trackFilterReset = () => {
    setAnalytics(prev => ({
      ...prev,
      resetCount: prev.resetCount + 1
    }));
  };

  // Track preset usage
  const trackPresetUsage = (presetId: string) => {
    setAnalytics(prev => {
      const newAnalytics = { ...prev };
      const existingIndex = newAnalytics.presetUsage.findIndex(p => p.presetId === presetId);
      if (existingIndex >= 0) {
        newAnalytics.presetUsage[existingIndex].count += 1;
      } else {
        newAnalytics.presetUsage.push({ presetId, count: 1 });
      }
      newAnalytics.presetUsage.sort((a, b) => b.count - a.count);
      return newAnalytics;
    });
  };

  // Get analytics
  const getAnalytics = (): FilterAnalytics => analytics;

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      const data = {
        filterState,
        presets,
        analytics
      };
      localStorage.setItem('filterSystem', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save filter data to localStorage:', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('filterSystem');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.filterState) setFilterState(parsed.filterState);
        if (parsed.presets) setPresets(parsed.presets);
        if (parsed.analytics) setAnalytics(parsed.analytics);
      }
    } catch (error) {
      console.error('Failed to load filter data from localStorage:', error);
    }
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('filterSystem');
    } catch (error) {
      console.error('Failed to clear filter data from localStorage:', error);
    }
  };

  const value: FilterContextType = {
    availableFilters,
    filterState,
    presets,
    analytics,
    setAvailableFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    resetFilters,
    applyFilters,
    hasActiveFilters,
    getFilterCount,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    trackFilterApplication,
    trackFilterReset,
    trackPresetUsage,
    getAnalytics,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
