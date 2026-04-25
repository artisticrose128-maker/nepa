import React, { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Save,
  Search,
  Calendar,
  Hash,
  CheckSquare,
  SlidersHorizontal
} from 'lucide-react';

interface FilterBarProps {
  className?: string;
  compact?: boolean;
  showQuickFilters?: boolean;
  showPresets?: boolean;
  position?: 'top' | 'side';
}

export const FilterBar: React.FC<FilterBarProps> = ({
  className = '',
  compact = false,
  showQuickFilters = true,
  showPresets = true,
  position = 'top'
}) => {
  const {
    availableFilters,
    filterState,
    presets,
    updateFilter,
    removeFilter,
    clearFilters,
    resetFilters,
    applyFilters,
    hasActiveFilters,
    getFilterCount,
    savePreset,
    loadPreset,
    deletePreset
  } = useFilters();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showQuickFilterMenu, setShowQuickFilterMenu] = useState<string | null>(null);

  const activeFilterCount = getFilterCount();

  const getQuickFilters = () => {
    return availableFilters.slice(0, 3); // Show first 3 filters as quick filters
  };

  const renderQuickFilter = (filter: any) => {
    const value = filterState.values[filter.id];
    const isActive = value !== '' && value !== null && value !== undefined;

    if (compact) {
      return (
        <div key={filter.id} className="relative">
          <button
            onClick={() => setShowQuickFilterMenu(showQuickFilterMenu === filter.id ? null : filter.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md border transition-colors
              ${isActive 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {getFilterIcon(filter.type)}
            <span className="text-sm">{filter.label}</span>
            {isActive && <X className="w-3 h-3" onClick={(e) => {
              e.stopPropagation();
              removeFilter(filter.id);
            }} />}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showQuickFilterMenu === filter.id && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-48">
              {renderCompactFilterInput(filter)}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    removeFilter(filter.id);
                    setShowQuickFilterMenu(null);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowQuickFilterMenu(null)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={filter.id} className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{filter.label}:</span>
        {renderCompactFilterInput(filter)}
      </div>
    );
  };

  const renderCompactFilterInput = (filter: any) => {
    const value = filterState.values[filter.id] || '';

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            {filter.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case 'boolean':
        return (
          <select
            value={value !== undefined ? value.toString() : ''}
            onChange={(e) => updateFilter(filter.id, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            placeholder={`Enter ${filter.label.toLowerCase()}`}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
    }
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Search className="w-4 h-4" />;
      case 'date':
      case 'daterange':
        return <Calendar className="w-4 h-4" />;
      case 'range':
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'boolean':
      case 'multiselect':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  const handleSavePreset = () => {
    const name = prompt('Enter preset name:');
    if (name?.trim()) {
      savePreset(name.trim());
    }
  };

  if (position === 'side') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        {showQuickFilters && getQuickFilters().map(filter => renderQuickFilter(filter))}

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filterState.activeFilters.map(filterId => {
                const filter = availableFilters.find(f => f.id === filterId);
                if (!filter) return null;
                
                return (
                  <span
                    key={filterId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filterId)}
                      className="p-0.5 rounded-full hover:bg-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters()}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            
            <button
              onClick={applyFilters}
              disabled={!filterState.isDirty}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Presets */}
        {showPresets && presets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Presets</span>
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showPresetMenu ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showPresetMenu && (
              <div className="space-y-1">
                {presets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2 text-sm hover:bg-gray-50 rounded"
                  >
                    <span>{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => loadPreset(preset.id)}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="text-xs p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showPresets && presets.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Save className="w-4 h-4" />
                Presets
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showPresetMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <div className="p-2 border-b border-gray-200">
                    <button
                      onClick={handleSavePreset}
                      disabled={!hasActiveFilters()}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Save Current Filters
                    </button>
                  </div>
                  {presets.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
                      <span className="text-sm">{preset.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => loadPreset(preset.id)}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="text-xs p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      {showQuickFilters && !showAdvanced && (
        <div className="p-4 border-b border-gray-200">
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {getQuickFilters().map(filter => renderQuickFilter(filter))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Active Filters</span>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterState.activeFilters.map(filterId => {
              const filter = availableFilters.find(f => f.id === filterId);
              if (!filter) return null;
              
              return (
                <span
                  key={filterId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filterId)}
                    className="p-1 rounded-full hover:bg-blue-200"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 space-y-4">
          {availableFilters.map(filter => (
            <div key={filter.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {getFilterIcon(filter.type)}
                <label className="text-sm font-medium text-gray-900">
                  {filter.label}
                </label>
              </div>
              {renderCompactFilterInput(filter)}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
        
        <button
          onClick={applyFilters}
          disabled={!filterState.isDirty}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
