import React, { useState } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { 
  Search, 
  Zap, 
  CreditCard, 
  User, 
  FileText, 
  Clock, 
  TrendingUp,
  Filter,
  ChevronRight,
  Star,
  ExternalLink
} from 'lucide-react';

interface SearchResultsProps {
  className?: string;
  showFilters?: boolean;
  maxResults?: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  className = '',
  showFilters = true,
  maxResults = 20
}) => {
  const { 
    results, 
    query, 
    isSearching, 
    filters, 
    updateFilter, 
    removeFilter, 
    clearFilters,
    performSearch 
  } = useSearch();

  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const getResultIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'meter':
        return <Zap className={`${iconClass} text-blue-500`} />;
      case 'payment':
        return <CreditCard className={`${iconClass} text-green-500`} />;
      case 'user':
        return <User className={`${iconClass} text-purple-500`} />;
      case 'transaction':
        return <Clock className={`${iconClass} text-orange-500`} />;
      case 'bill':
        return <FileText className={`${iconClass} text-red-500`} />;
      default:
        return <Search className={`${iconClass} text-gray-500`} />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'meter': return 'Meter';
      case 'payment': return 'Payment';
      case 'user': return 'User';
      case 'transaction': return 'Transaction';
      case 'bill': return 'Bill';
      default: return 'Result';
    }
  };

  const handleResultClick = (result: any) => {
    setSelectedResult(result.id);
    // In a real app, this would navigate to the detail page
    console.log('Navigate to:', result);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    updateFilter(filterId, value);
    performSearch();
  };

  const availableFilters = [
    {
      id: 'type',
      label: 'Type',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Types' },
        { value: 'meter', label: 'Meters' },
        { value: 'payment', label: 'Payments' },
        { value: 'user', label: 'Users' },
        { value: 'transaction', label: 'Transactions' },
        { value: 'bill', label: 'Bills' }
      ]
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'select' as const,
      options: [
        { value: '', label: 'Any Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ];

  const displayedResults = results.slice(0, maxResults);

  if (isSearching) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Searching...</p>
      </div>
    );
  }

  if (!query && results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Searching</h3>
        <p className="text-gray-600">Enter a search term to find meters, payments, users, and more.</p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-4">No results found for "{query}". Try different keywords or filters.</p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
          <p className="text-gray-600">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            {availableFilters.map(filter => (
              <div key={filter.id} className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filter.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([filterId, value]) => {
                    const filter = availableFilters.find(f => f.id === filterId);
                    if (!filter || !value) return null;
                    
                    const option = filter.options?.find(opt => opt.value === value);
                    
                    return (
                      <span
                        key={filterId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {filter.label}: {option?.label || value}
                        <button
                          onClick={() => removeFilter(filterId)}
                          className="p-1 rounded-full hover:bg-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
                
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {displayedResults.map((result) => (
          <div
            key={result.id}
            className={`
              bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all
              hover:border-blue-300 hover:shadow-md
              ${selectedResult === result.id ? 'border-blue-500 shadow-md' : ''}
            `}
            onClick={() => handleResultClick(result)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getResultIcon(result.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getResultTypeLabel(result.type)}
                      </span>
                      {result.relevanceScore && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-500">
                            {Math.round(result.relevanceScore * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{result.description}</p>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="font-medium capitalize">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('View details:', result);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                {/* Highlighted Fields */}
                {result.highlightedFields && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="space-y-1">
                      {Object.entries(result.highlightedFields).map(([field, highlight]) => (
                        <div key={field} className="text-sm">
                          <span className="font-medium text-gray-700">{field}:</span>
                          <span 
                            className="ml-2 text-gray-600"
                            dangerouslySetInnerHTML={{ __html: highlight }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {results.length > maxResults && (
        <div className="text-center py-4">
          <button
            onClick={() => console.log('Load more results')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load More Results ({results.length - maxResults} remaining)
          </button>
        </div>
      )}

      {/* Search Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Search Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use specific keywords like "meter", "payment", or "user"</li>
          <li>• Try different combinations of filters</li>
          <li>• Check your spelling for better results</li>
          <li>• Use quotes for exact phrase searches</li>
        </ul>
      </div>
    </div>
  );
};
