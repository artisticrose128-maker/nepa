import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
}

interface TableAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (row: any) => void;
  disabled?: (row: any) => boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface FilterOption {
  key: string;
  label: string;
  value: any;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: any }[];
}

interface AdvancedTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: FilterOption[];
    values: { [key: string]: any };
    onFilterChange: (values: { [key: string]: any }) => void;
  };
  selection?: {
    selectedRows: any[];
    onSelectionChange: (selectedRows: any[]) => void;
  };
  bulkActions?: {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: (selectedRows: any[]) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  exportOptions?: {
    csv?: boolean;
    excel?: boolean;
    pdf?: boolean;
    onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  };
  className?: string;
  emptyMessage?: string;
  virtualScrolling?: boolean;
  rowHeight?: number;
  maxHeight?: number;
}

export const AdvancedDataTable = ({
  data,
  columns,
  actions = [],
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  bulkActions = [],
  exportOptions,
  className = '',
  emptyMessage = 'No data available',
  virtualScrolling = false,
  rowHeight = 50,
  maxHeight = 400
}: AdvancedTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(row => {
        return columns.some(column => {
          const value = row[column.key];
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Apply filters
    if (filtering?.values) {
      filtered = filtered.filter(row => {
        return Object.entries(filtering.values).every(([key, value]) => {
          if (value === '' || value === null || value === undefined) return true;
          const rowValue = row[key];
          if (rowValue === null || rowValue === undefined) return false;
          return rowValue.toString().toLowerCase().includes(value.toString().toLowerCase());
        });
      });
    }

    return filtered;
  }, [data, searchQuery, filtering?.values, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sorting?.field) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sorting.field];
      const bValue = b[sorting.field];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = aValue.toString().localeCompare(bValue.toString());
      }

      return sorting.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return sortedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedData, pagination]);

  // Get current page data for rendering
  const currentData = virtualScrolling ? sortedData : paginatedData;

  // Handle column sorting
  const handleSort = useCallback((column: TableColumn) => {
    if (!column.sortable || !sorting) return;

    const newDirection = sorting.field === column.key && sorting.direction === 'asc' ? 'desc' : 'asc';
    sorting.onSort(column.key, newDirection);
  }, [sorting]);

  // Handle row selection
  const handleRowSelection = useCallback((row: any, checked: boolean) => {
    if (!selection) return;

    let newSelection;
    if (checked) {
      newSelection = [...selection.selectedRows, row];
    } else {
      newSelection = selection.selectedRows.filter(r => r !== row);
    }

    selection.onSelectionChange(newSelection);
  }, [selection]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!selection) return;

    selection.onSelectionChange(checked ? [...currentData] : []);
  }, [selection, currentData]);

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    exportOptions?.onExport(format);
  }, [exportOptions]);

  // Format cell value
  const formatValue = useCallback((value: any, column: TableColumn) => {
    if (column.render) {
      return column.render(value, data.find(row => row[column.key] === value));
    }

    if (column.format) {
      return column.format(value);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (column.type === 'number') {
      return new Intl.NumberFormat().format(value);
    }

    return value;
  }, [data]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const isAllSelected = selection ? selection.selectedRows.length === currentData.length : false;
  const isIndeterminate = selection ? selection.selectedRows.length > 0 && selection.selectedRows.length < currentData.length : false;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {selection && selection.selectedRows.length > 0 && bulkActions.length > 0 && (
          <BulkActionBar 
            selectedCount={selection.selectedRows.length}
            actions={bulkActions.map(action => ({
              ...action,
              onClick: () => action.onClick(selection.selectedRows)
            }))}
            onClear={() => selection.onSelectionChange([])}
          />
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Filters */}
            {filtering && (
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {Object.values(filtering.values).some(v => v !== '' && v !== null && v !== undefined) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {filtering.filters.map(filter => (
                        <div key={filter.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {filter.label}
                          </label>
                          {filter.type === 'text' && (
                            <input
                              type="text"
                              value={filtering.values[filter.key] || ''}
                              onChange={(e) => filtering.onFilterChange({
                                ...filtering.values,
                                [filter.key]: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                          {filter.type === 'select' && (
                            <select
                              value={filtering.values[filter.key] || ''}
                              onChange={(e) => filtering.onFilterChange({
                                ...filtering.values,
                                [filter.key]: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">All</option>
                              {filter.options?.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          filtering.onFilterChange({});
                          setSearchQuery('');
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            {exportOptions && (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            )}

            {/* Column Selector */}
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-gray-500">{emptyMessage}</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* Selection Column */}
                {selection && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                
                {/* Data Columns */}
                {columns.filter(col => visibleColumns.includes(col.key)).map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sorting && sorting.field === column.key && (
                        sorting.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Actions Column */}
                {actions.length > 0 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, index) => {
                const isSelected = selection ? selection.selectedRows.includes(row) : false;
                const rowId = row.id || index;
                
                return (
                  <tr key={rowId} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                    {/* Selection Cell */}
                    {selection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelection(row, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    
                    {/* Data Cells */}
                    {columns.filter(col => visibleColumns.includes(col.key)).map(column => (
                      <td key={column.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(row[column.key], column)}
                      </td>
                    ))}
                    
                    {/* Actions Cell */}
                    {actions.length > 0 && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === rowId ? null : rowId)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Action Menu */}
                          {actionMenuOpen === rowId && (
                            <div
                              ref={actionMenuRef}
                              className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
                            >
                              {actions.map(action => {
                                const isDisabled = action.disabled ? action.disabled(row) : false;
                                
                                return (
                                  <button
                                    key={action.key}
                                    onClick={() => {
                                      if (!isDisabled) {
                                        action.onClick(row);
                                        setActionMenuOpen(null);
                                      }
                                    }}
                                    disabled={isDisabled}
                                    className={`
                                      w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                                      ${isDisabled 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : action.variant === 'danger'
                                          ? 'text-red-600 hover:bg-red-50'
                                          : 'text-gray-700 hover:bg-gray-100'
                                      }
                                    `}
                                  >
                                    {action.icon}
                                    <span>{action.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} results
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Page Size Selector */}
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              {/* Pagination Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => pagination.onPageChange(1)}
                  disabled={pagination.page === 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-3" />
                </button>
                
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.page} of {totalPages}
                </span>
                
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => pagination.onPageChange(totalPages)}
                  disabled={pagination.page === totalPages}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface BulkActionBarProps {
  selectedCount: number;
  actions: {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, actions, onClear }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center space-x-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center space-x-3 border-r border-gray-700 pr-6">
        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
          {selectedCount}
        </span>
        <span className="text-sm font-medium">Selected Items</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {actions.map(action => (
          <button
            key={action.key}
            onClick={action.onClick}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${action.variant === 'danger'
                ? 'hover:bg-red-500 hover:text-white text-red-400'
                : 'hover:bg-gray-800 text-gray-300'
              }
            `}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      
      <button
        onClick={onClear}
        className="text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Clear selection"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
