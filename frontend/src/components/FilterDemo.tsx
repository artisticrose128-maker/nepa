import React, { useState, useEffect } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { FilterPanel } from './FilterPanel';
import { FilterBar } from './FilterBar';
import { FilterAnalytics } from './FilterAnalytics';
import { DataTable } from './DataTable';
import { 
  Filter, 
  BarChart3, 
  Save, 
  RotateCcw, 
  Settings, 
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export const FilterDemo: React.FC = () => {
  const { 
    setAvailableFilters, 
    filterState, 
    hasActiveFilters, 
    getFilterCount,
    applyFilters,
    clearFilters,
    resetFilters
  } = useFilters();

  const [showData, setShowData] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filteredData, setFilteredData] = useState(sampleData);

  // Sample data for demonstration
  const sampleData = [
    { id: 1, customer: 'John Doe', meterNumber: 'METER-001', amount: 5000, status: 'SUCCESS', date: '2024-01-15', type: 'electricity', region: 'Lagos' },
    { id: 2, customer: 'Jane Smith', meterNumber: 'METER-002', amount: 3500, status: 'PENDING', date: '2024-01-14', type: 'water', region: 'Abuja' },
    { id: 3, customer: 'Bob Johnson', meterNumber: 'METER-003', amount: 7500, status: 'FAILED', date: '2024-01-13', type: 'electricity', region: 'Port Harcourt' },
    { id: 4, customer: 'Alice Brown', meterNumber: 'METER-004', amount: 2000, status: 'SUCCESS', date: '2024-01-12', type: 'gas', region: 'Kano' },
    { id: 5, customer: 'Charlie Wilson', meterNumber: 'METER-005', amount: 8000, status: 'PROCESSING', date: '2024-01-11', type: 'electricity', region: 'Lagos' },
    { id: 6, customer: 'Diana Martinez', meterNumber: 'METER-006', amount: 4500, status: 'SUCCESS', date: '2024-01-10', type: 'water', region: 'Ibadan' },
    { id: 7, customer: 'Edward Davis', meterNumber: 'METER-007', amount: 6000, status: 'PENDING', date: '2024-01-09', type: 'electricity', region: 'Enugu' },
    { id: 8, customer: 'Fiona Garcia', meterNumber: 'METER-008', amount: 3000, status: 'SUCCESS', date: '2024-01-08', type: 'gas', region: 'Benin City' }
  ];

  // Initialize available filters
  useEffect(() => {
    const filters = [
      {
        id: 'customer',
        label: 'Customer Name',
        field: 'customer',
        type: 'text' as const,
        placeholder: 'Search by customer name'
      },
      {
        id: 'meterNumber',
        label: 'Meter Number',
        field: 'meterNumber',
        type: 'text' as const,
        placeholder: 'Search by meter number'
      },
      {
        id: 'status',
        label: 'Status',
        field: 'status',
        type: 'select' as const,
        options: [
          { value: 'SUCCESS', label: 'Success' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'FAILED', label: 'Failed' },
          { value: 'PROCESSING', label: 'Processing' }
        ]
      },
      {
        id: 'type',
        label: 'Service Type',
        field: 'type',
        type: 'multiselect' as const,
        options: [
          { value: 'electricity', label: 'Electricity' },
          { value: 'water', label: 'Water' },
          { value: 'gas', label: 'Gas' }
        ]
      },
      {
        id: 'region',
        label: 'Region',
        field: 'region',
        type: 'select' as const,
        options: [
          { value: 'Lagos', label: 'Lagos' },
          { value: 'Abuja', label: 'Abuja' },
          { value: 'Port Harcourt', label: 'Port Harcourt' },
          { value: 'Kano', label: 'Kano' },
          { value: 'Ibadan', label: 'Ibadan' },
          { value: 'Enugu', label: 'Enugu' },
          { value: 'Benin City', label: 'Benin City' }
        ]
      },
      {
        id: 'amount',
        label: 'Amount Range',
        field: 'amount',
        type: 'range' as const,
        min: 0,
        max: 10000
      },
      {
        id: 'date',
        label: 'Date',
        field: 'date',
        type: 'daterange' as const
      },
      {
        id: 'hasIssues',
        label: 'Has Issues',
        field: 'hasIssues',
        type: 'boolean' as const
      }
    ];

    setAvailableFilters(filters);
  }, [setAvailableFilters]);

  // Apply filters to data
  useEffect(() => {
    let filtered = [...sampleData];

    Object.entries(filterState.lastApplied).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) return;

      switch (key) {
        case 'customer':
        case 'meterNumber':
          filtered = filtered.filter(item => 
            item[key]?.toString().toLowerCase().includes(value.toString().toLowerCase())
          );
          break;
        
        case 'status':
        case 'region':
        case 'type':
          if (Array.isArray(value)) {
            filtered = filtered.filter(item => value.includes(item[key]));
          } else {
            filtered = filtered.filter(item => item[key] === value);
          }
          break;
        
        case 'amount':
          if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            filtered = filtered.filter(item => 
              item[key] >= (value.min || 0) && item[key] <= (value.max || Infinity)
            );
          }
          break;
        
        case 'date':
          if (typeof value === 'object' && value.start && value.end) {
            filtered = filtered.filter(item => {
              const itemDate = new Date(item[key]);
              return itemDate >= new Date(value.start) && itemDate <= new Date(value.end);
            });
          }
          break;
        
        case 'hasIssues':
          filtered = filtered.filter(item => 
            value === true ? ['FAILED', 'PROCESSING'].includes(item.status) : ['SUCCESS'].includes(item.status)
          );
          break;
      }
    });

    setFilteredData(filtered);
  }, [filterState.lastApplied, sampleData]);

  const tableColumns = [
    { key: 'customer', label: 'Customer', sortable: true, filterable: true },
    { key: 'meterNumber', label: 'Meter Number', sortable: true, filterable: true },
    { key: 'amount', label: 'Amount (₦)', sortable: true, type: 'number' as const },
    { key: 'status', label: 'Status', sortable: true, type: 'custom' as const, render: (value: any) => {
      const colors = {
        SUCCESS: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        FAILED: 'bg-red-100 text-red-800',
        PROCESSING: 'bg-blue-100 text-blue-800'
      };
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
          {value}
        </span>
      );
    }},
    { key: 'type', label: 'Type', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'date', label: 'Date', sortable: true, type: 'date' as const }
  ];

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Components</h3>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getFilterCount()} filters active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowData(!showData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showData ? 'Hide' : 'Show'} Data
          </button>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Filter Bar (Compact)</h4>
        <FilterBar 
          compact={true} 
          showQuickFilters={true}
          showPresets={true}
          className="mb-4"
        />
      </div>

      {/* Filter Panel */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Filter Panel (Advanced)</h4>
        <FilterPanel 
          collapsible={true}
          showPresets={true}
          showAnalytics={false}
          className="mb-4"
          onApply={() => console.log('Filters applied')}
          onReset={() => console.log('Filters reset')}
        />
      </div>

      {/* Filter Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Filter Actions</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyFilters}
            disabled={!filterState.isDirty}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Last Applied
          </button>
          
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings className="w-4 h-4" />
            Clear All
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>• <strong>Apply Filters:</strong> Save current filter values and apply to data</p>
          <p>• <strong>Reset to Last Applied:</strong> Restore the last applied filter state</p>
          <p>• <strong>Clear All:</strong> Remove all active filters</p>
        </div>
      </div>

      {/* Filter State Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-blue-900 mb-3">Filter State Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Active Filters:</span>
            <span className="ml-2 font-medium text-blue-900">{getFilterCount()}</span>
          </div>
          <div>
            <span className="text-blue-700">Dirty State:</span>
            <span className="ml-2 font-medium text-blue-900">{filterState.isDirty ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-blue-700">Filtered Results:</span>
            <span className="ml-2 font-medium text-blue-900">{filteredData.length} of {sampleData.length}</span>
          </div>
        </div>
        
        {hasActiveFilters() && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Active Filter Values:</strong>
            </p>
            <div className="mt-2 space-y-1">
              {Object.entries(filterState.lastApplied).map(([key, value]) => {
                if (value === '' || value === null || value === undefined) return null;
                return (
                  <div key={key} className="text-xs text-blue-700">
                    <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {showData && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Filtered Data Results</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <DataTable
              data={filteredData}
              columns={tableColumns}
              searchable={false}
              pagination={true}
              pageSize={5}
              emptyMessage="No data matches the current filters"
            />
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Filter Analytics</h4>
          <FilterAnalytics showExport={true} />
        </div>
      )}

      {/* Features Overview */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-green-900 mb-3">✅ Features Implemented</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <p>• <strong>Filter Components:</strong> FilterBar & FilterPanel</p>
            <p>• <strong>Filter Types:</strong> Text, Select, Multi-select, Range, Date, Boolean</p>
            <p>• <strong>Filter Persistence:</strong> Automatic localStorage save/restore</p>
            <p>• <strong>Filter Combinations:</strong> Track and analyze filter combinations</p>
          </div>
          <div>
            <p>• <strong>Filter Reset:</strong> Reset to last applied or clear all</p>
            <p>• <strong>Filter Presets:</strong> Save and load filter configurations</p>
            <p>• <strong>Filter Analytics:</strong> Usage tracking and insights</p>
            <p>• <strong>Accessibility:</strong> Full ARIA support and keyboard navigation</p>
          </div>
        </div>
      </div>
    </div>
  );
};
