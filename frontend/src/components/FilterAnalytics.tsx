import React, { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Filter, 
  RotateCcw, 
  Save, 
  Download,
  RefreshCw,
  Calendar,
  Users,
  Activity,
  Target
} from 'lucide-react';

interface FilterAnalyticsProps {
  className?: string;
  showExport?: boolean;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export const FilterAnalytics: React.FC<FilterAnalyticsProps> = ({
  className = '',
  showExport = true,
  timeRange = '30d'
}) => {
  const { analytics, presets, availableFilters, getAnalytics } = useFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = {
      analytics: getAnalytics(),
      presets: presets,
      availableFilters: availableFilters.map(f => ({
        id: f.id,
        label: f.label,
        type: f.type
      })),
      exportDate: new Date().toISOString(),
      timeRange: selectedTimeRange
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filter-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const csvHeaders = ['Filter ID', 'Filter Label', 'Usage Count', 'Type'];
      const csvRows = analytics.mostUsedFilters.map(item => {
        const filter = availableFilters.find(f => f.id === item.filterId);
        return [
          item.filterId,
          filter?.label || 'Unknown',
          item.count.toString(),
          filter?.type || 'unknown'
        ];
      });
      
      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filter-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getFilterLabel = (filterId: string) => {
    const filter = availableFilters.find(f => f.id === filterId);
    return filter?.label || filterId;
  };

  const getFilterUsagePercentage = (count: number) => {
    const total = analytics.mostUsedFilters.reduce((sum, f) => sum + f.count, 0);
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  const getCombinationLabel = (combination: string) => {
    return combination.split(',').map(id => getFilterLabel(id)).join(' + ');
  };

  const getPresetUsagePercentage = (count: number) => {
    const total = analytics.presetUsage.reduce((sum, p) => sum + p.count, 0);
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Filter Analytics</h2>
          <p className="text-gray-600">Monitor filter usage patterns and user behavior</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Export Buttons */}
          {showExport && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Filter applications</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Filters Per Use</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageFiltersPerApplication.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Average complexity</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reset Count</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.resetCount}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RotateCcw className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Filter resets</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saved Presets</p>
              <p className="text-2xl font-bold text-gray-900">{presets.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Save className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">User presets</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Filters</h3>
          <div className="space-y-3">
            {analytics.mostUsedFilters.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{getFilterLabel(item.filterId)}</span>
                    <p className="text-xs text-gray-500">{item.count} uses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${getFilterUsagePercentage(item.count)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-10 text-right">
                    {getFilterUsagePercentage(item.count)}%
                  </span>
                </div>
              </div>
            ))}
            {analytics.mostUsedFilters.length === 0 && (
              <p className="text-gray-500 text-center py-4">No filter usage data available</p>
            )}
          </div>
        </div>

        {/* Filter Combinations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Filter Combinations</h3>
          <div className="space-y-3">
            {analytics.filterCombinations.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {getCombinationLabel(item.combination)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">{item.count} uses</p>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min((item.count / analytics.filterCombinations[0]?.count || 1) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {analytics.filterCombinations.length === 0 && (
              <p className="text-gray-500 text-center py-4">No combination data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Preset Usage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preset Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.presetUsage.slice(0, 6).map((item, index) => {
            const preset = presets.find(p => p.id === item.presetId);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {preset?.name || 'Unknown Preset'}
                  </p>
                  {preset?.description && (
                    <p className="text-xs text-gray-500 truncate">{preset.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <div className="w-12 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-purple-600 h-1 rounded-full"
                      style={{ width: `${getPresetUsagePercentage(item.count)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {analytics.presetUsage.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No preset usage data available</p>
          )}
        </div>
      </div>

      {/* Filter Performance Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">Filter Efficiency</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Average filters per application:</span>
                <span className="font-medium text-blue-900">{analytics.averageFiltersPerApplication.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Reset rate:</span>
                <span className="font-medium text-blue-900">
                  {analytics.totalApplications > 0 ? ((analytics.resetCount / analytics.totalApplications) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">User Engagement</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Total filter applications:</span>
                <span className="font-medium text-blue-900">{analytics.totalApplications}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Preset adoption rate:</span>
                <span className="font-medium text-blue-900">
                  {analytics.totalApplications > 0 ? ((analytics.presetUsage.reduce((sum, p) => sum + p.count, 0) / analytics.totalApplications) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Recommendation:</strong> 
            {analytics.averageFiltersPerApplication > 3 
              ? ' Users are applying many filters. Consider creating more presets for common combinations.'
              : analytics.resetCount / analytics.totalApplications > 0.3
              ? ' High reset rate detected. Consider improving filter defaults or adding better guidance.'
              : ' Filter usage looks good. Consider promoting popular filter combinations to presets.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
