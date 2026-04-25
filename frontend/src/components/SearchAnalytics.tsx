import React, { useState } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { 
  TrendingUp, 
  Search, 
  Clock, 
  Filter, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Users,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface SearchAnalyticsProps {
  className?: string;
  showExport?: boolean;
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  className = '',
  showExport = true
}) => {
  const { analytics, history, getAnalytics } = useSearch();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = {
      analytics: getAnalytics(),
      history: history,
      exportDate: new Date().toISOString(),
      timeRange
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const csvHeaders = ['Date', 'Query', 'Result Count', 'Duration', 'Filters'];
      const csvRows = history.map(item => [
        item.timestamp.toISOString().split('T')[0],
        item.query,
        item.resultCount || 0,
        item.duration || 0,
        JSON.stringify(item.filters)
      ]);
      
      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getRecentSearches = () => {
    const cutoff = new Date();
    switch (timeRange) {
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(cutoff.getDate() - 90);
        break;
    }
    
    return history.filter(item => item.timestamp >= cutoff);
  };

  const recentSearches = getRecentSearches();
  const averageResultsPerSearch = recentSearches.length > 0 
    ? recentSearches.reduce((sum, item) => sum + (item.resultCount || 0), 0) / recentSearches.length 
    : 0;

  const getSearchFrequencyData = () => {
    const frequency = analytics.searchFrequency.slice(-7); // Last 7 days
    return frequency.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: item.count
    }));
  };

  const getTopSearches = () => analytics.mostSearchedTerms.slice(0, 5);

  const getFilterUsageData = () => {
    return Object.entries(analytics.filterUsage)
      .map(([filter, usage]) => ({ filter, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
          <p className="text-gray-600">Monitor search performance and user behavior</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
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
              <p className="text-sm text-gray-600">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSearches}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              {recentSearches.length} searches in selected period
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Query Length</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageQueryLength.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Characters per search</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Results</p>
              <p className="text-2xl font-bold text-gray-900">{averageResultsPerSearch.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Results per search</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">No Result Queries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.noResultQueries.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Queries with no results</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Frequency Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Frequency</h3>
          <div className="space-y-4">
            {getSearchFrequencyData().map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">{item.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((item.count / Math.max(...getSearchFrequencyData().map(d => d.count))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Searches */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Searches</h3>
          <div className="space-y-3">
            {getTopSearches().map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.term}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.count} searches</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(item.count / getTopSearches()[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {getTopSearches().length === 0 && (
              <p className="text-gray-500 text-center py-4">No search data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Usage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilterUsageData().map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{item.filter}</span>
              </div>
              <span className="text-sm text-gray-600">{item.usage} uses</span>
            </div>
          ))}
          {getFilterUsageData().length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No filter usage data available</p>
          )}
        </div>
      </div>

      {/* Recent Search History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Search History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-medium text-gray-900">Query</th>
                <th className="text-left py-2 px-4 font-medium text-gray-900">Results</th>
                <th className="text-left py-2 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-left py-2 px-4 font-medium text-gray-900">Filters</th>
                <th className="text-left py-2 px-4 font-medium text-gray-900">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSearches.slice(0, 10).map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-4">
                    <span className="font-medium text-gray-900">{item.query}</span>
                  </td>
                  <td className="py-2 px-4 text-gray-600">{item.resultCount || 0}</td>
                  <td className="py-2 px-4 text-gray-600">{item.duration || 0}ms</td>
                  <td className="py-2 px-4">
                    {Object.keys(item.filters).length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {Object.keys(item.filters).length} filter{Object.keys(item.filters).length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-gray-600">
                    {item.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentSearches.length === 0 && (
            <p className="text-gray-500 text-center py-4">No search history available</p>
          )}
        </div>
      </div>

      {/* No Result Queries */}
      {analytics.noResultQueries.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">Queries with No Results</h3>
          <div className="space-y-2">
            {analytics.noResultQueries.slice(0, 5).map((query, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-yellow-100 rounded">
                <span className="text-sm font-medium text-yellow-900">{query}</span>
                <span className="text-xs text-yellow-700">Consider adding synonyms or improving search</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-yellow-800">
              💡 Consider improving search suggestions or adding content for these queries
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
