import React, { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { 
  Filter, 
  X, 
  Plus, 
  Save, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Search,
  Calendar,
  Hash,
  CheckSquare
} from 'lucide-react';

interface FilterPanelProps {
  className?: string;
  collapsible?: boolean;
  showPresets?: boolean;
  showAnalytics?: boolean;
  onApply?: () => void;
  onReset?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  className = '',
  collapsible = true,
  showPresets = true,
  showAnalytics = false,
  onApply,
  onReset
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
    deletePreset,
    getAnalytics
  } = useFilters();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const handleApply = () => {
    applyFilters();
    onApply?.();
  };

  const handleReset = () => {
    resetFilters();
    onReset?.();
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), presetDescription.trim());
      setPresetName('');
      setPresetDescription('');
      setShowPresetDialog(false);
    }
  };

  const renderFilterInput = (filter: any) => {
    const value = filterState.values[filter.id] || '';

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options?.map((option: any) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      updateFilter(filter.id, [...currentValues, option.value]);
                    } else {
                      updateFilter(filter.id, currentValues.filter((v: any) => v !== option.value));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value?.min || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, min: e.target.value })}
              placeholder="Min"
              min={filter.min}
              max={filter.max}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={value?.max || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, max: e.target.value })}
              placeholder="Max"
              min={filter.min}
              max={filter.max}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateFilter(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'daterange':
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, start: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => updateFilter(filter.id, { ...value, end: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'boolean':
        return (
          <select
            value={value !== undefined ? value.toString() : ''}
            onChange={(e) => updateFilter(filter.id, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

  const activeFilterCount = getFilterCount();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {/* Active Filters */}
          {hasActiveFilters() && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
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

          {/* Filter Inputs */}
          <div className="space-y-4">
            {availableFilters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getFilterIcon(filter.type)}
                  <label className="text-sm font-medium text-gray-900">
                    {filter.label}
                  </label>
                </div>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* Presets */}
          {showPresets && presets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Saved Presets</h4>
              <div className="space-y-2">
                {presets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      {preset.description && (
                        <div className="text-sm text-gray-600">{preset.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadPreset(preset.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        aria-label={`Delete ${preset.name} preset`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          {showAnalytics && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filter Analytics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Applications:</span>
                  <span className="ml-2 font-medium">{getAnalytics().totalApplications}</span>
                </div>
                <div>
                  <span className="text-gray-600">Average Filters:</span>
                  <span className="ml-2 font-medium">{getAnalytics().averageFiltersPerApplication.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reset Count:</span>
                  <span className="ml-2 font-medium">{getAnalytics().resetCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Presets Saved:</span>
                  <span className="ml-2 font-medium">{presets.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresetDialog(true)}
                disabled={!hasActiveFilters()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Preset
              </button>
              
              <button
                onClick={handleReset}
                disabled={!hasActiveFilters()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters()}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
            
            <button
              onClick={handleApply}
              disabled={!filterState.isDirty}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Preset Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Filter Preset</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Enter preset description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPresetDialog(false);
                  setPresetName('');
                  setPresetDescription('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
