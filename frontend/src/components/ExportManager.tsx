import React, { useState, useEffect } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Filter, Calendar, User, CreditCard, BarChart3, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Settings } from 'lucide-react';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { format } from 'date-fns';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: string;
  utilityType?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

interface ExportProgress {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface ExportTemplate {
  name: string;
  displayName: string;
  description: string;
  columns: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

interface ExportFormat {
  value: string;
  label: string;
  description: string;
}

interface ExportTemplatesResponse {
  dataTypes: ExportTemplate[];
  formats: ExportFormat[];
  filters: {
    statuses: {
      payments: string[];
      bills: string[];
    };
    utilityTypes: string[];
    userRoles: string[];
  };
}

const ExportManager: React.FC = () => {
  const [templates, setTemplates] = useState<ExportTemplatesResponse | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>('payments');
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<ExportFilters>({});
  const [exports, setExports] = useState<ExportProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Load export templates on component mount
  useEffect(() => {
    loadExportTemplates();
    loadExportHistory();
    
    // Set up polling for export progress
    const interval = setInterval(() => {
      if (exports.some(exp => exp.status === 'processing')) {
        loadExportHistory();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadExportTemplates = async () => {
    try {
      const response = await axios.get('/api/export/templates');
      setTemplates(response.data);
      
      // Set default columns for selected data type
      const dataType = response.data.dataTypes.find((dt: ExportTemplate) => dt.name === selectedDataType);
      if (dataType) {
        setSelectedColumns(dataType.columns.map(col => col.id));
      }
    } catch (error) {
      console.error('Failed to load export templates:', error);
    }
  };

  const loadExportHistory = async () => {
    try {
      const response = await axios.get('/api/export/progress');
      setExports(response.data.sort((a: ExportProgress, b: ExportProgress) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  };

  const handleDataTypeChange = (dataType: string) => {
    setSelectedDataType(dataType);
    const newDataType = templates?.dataTypes.find(dt => dt.name === dataType);
    if (newDataType) {
      setSelectedColumns(newDataType.columns.map(col => col.id));
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleStartExport = async () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export');
      return;
    }

    setIsLoading(true);
    try {
      const exportData = {
        format: selectedFormat,
        dataType: selectedDataType,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        columns: selectedColumns
      };

      const response = await axios.post('/api/export', exportData);
      
      // Refresh export history
      await loadExportHistory();
      
      // Switch to history tab to show progress
      setActiveTab('history');
      
    } catch (error) {
      console.error('Failed to start export:', error);
      alert('Failed to start export. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (exportId: string) => {
    try {
      const response = await axios.get(`/api/export/download/${exportId}`, {
        responseType: 'blob'
      });
      
      // Get filename from content-disposition header or create one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `export_${exportId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Determine file extension based on format
      const exportItem = exports.find(exp => exp.id === exportId);
      if (exportItem) {
        const format = filename.includes('.csv') ? 'csv' : 
                      filename.includes('.xlsx') ? 'xlsx' : 'pdf';
        filename = `${selectedDataType}_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.${format}`;
      }
      
      saveAs(response.data, filename);
    } catch (error) {
      console.error('Failed to download export:', error);
      alert('Failed to download export. Please try again.');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up old exports? This will remove exports older than 24 hours.')) {
      return;
    }

    try {
      await axios.post('/api/export/cleanup', { maxAgeHours: 24 });
      await loadExportHistory();
      alert('Export cleanup completed successfully');
    } catch (error) {
      console.error('Failed to cleanup exports:', error);
      alert('Failed to cleanup exports. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDataIcon = (dataType: string) => {
    switch (dataType) {
      case 'payments':
        return <CreditCard className="w-4 h-4" />;
      case 'bills':
        return <FileText className="w-4 h-4" />;
      case 'users':
        return <User className="w-4 h-4" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Table className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <Table className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  if (!templates) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading export templates...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Export Manager</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Export
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Export History ({exports.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Data Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.dataTypes.map((dataType) => (
                <button
                  key={dataType.name}
                  onClick={() => handleDataTypeChange(dataType.name)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedDataType === dataType.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {getDataIcon(dataType.name)}
                    <span className="text-sm font-medium">{dataType.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {templates.formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {getFormatIcon(format.value)}
                    <span className="text-sm font-medium">{format.label}</span>
                    <span className="text-xs text-gray-500">{format.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Columns to Export ({selectedColumns.length} selected)
              </label>
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showColumnSelector ? 'Hide' : 'Show'} Column Selector
              </button>
            </div>
            
            {showColumnSelector && (
              <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {templates.dataTypes
                    .find(dt => dt.name === selectedDataType)
                    ?.columns.map((column) => (
                      <label
                        key={column.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column.id)}
                          onChange={() => handleColumnToggle(column.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{column.title}</div>
                          <div className="text-xs text-gray-500">{column.description}</div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Filters</label>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {selectedDataType === 'payments' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      {templates.filters.statuses.payments.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedDataType === 'bills' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bill Status
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Statuses</option>
                        {templates.filters.statuses.bills.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utility Type
                      </label>
                      <select
                        value={filters.utilityType || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, utilityType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Types</option>
                        {templates.filters.utilityTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedDataType === 'users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role
                    </label>
                    <select
                      value={filters.role || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Roles</option>
                      {templates.filters.userRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limit (records)
                    </label>
                    <input
                      type="number"
                      value={filters.limit || 1000}
                      onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) || 1000 }))}
                      min="1"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offset
                    </label>
                    <input
                      type="number"
                      value={filters.offset || 0}
                      onChange={(e) => setFilters(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setFilters({});
                setSelectedColumns(
                  templates.dataTypes
                    .find(dt => dt.name === selectedDataType)
                    ?.columns.map(col => col.id) || []
                );
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleStartExport}
              disabled={isLoading || selectedColumns.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Starting Export...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Start Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
              <button
                onClick={loadExportHistory}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {exports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No exports found. Create your first export to get started.</p>
              </div>
            ) : (
              exports.map((exportItem) => (
                <div key={exportItem.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(exportItem.status)}
                        <span className="font-medium text-gray-900">
                          {exportItem.dataType?.charAt(0).toUpperCase() + exportItem.dataType?.slice(1)} Export
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(exportItem.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>Format: {exportItem.id.includes('.csv') ? 'CSV' : exportItem.id.includes('.xlsx') ? 'Excel' : 'PDF'}</span>
                        <span>Records: {exportItem.processedRecords} / {exportItem.totalRecords}</span>
                        {exportItem.completedAt && (
                          <span>Completed: {format(new Date(exportItem.completedAt), 'MMM dd, HH:mm')}</span>
                        )}
                      </div>

                      {exportItem.status === 'processing' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${exportItem.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 mt-1">
                            {exportItem.progress}% complete
                          </span>
                        </div>
                      )}

                      {exportItem.error && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {exportItem.error}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {exportItem.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(exportItem.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                      
                      {exportItem.status === 'failed' && (
                        <button
                          onClick={() => {
                            // Retry logic could be implemented here
                            alert('Retry functionality not implemented yet');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {exports.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleCleanup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cleanup Old Exports</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportManager;
