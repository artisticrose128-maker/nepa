import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'meter' | 'payment' | 'user' | 'history' | 'transaction' | 'bill';
  metadata?: Record<string, any>;
  highlight?: string;
}

export interface SearchFilter {
  id: string;
  label: string;
  field: string;
  type: 'select' | 'range' | 'date' | 'multiselect';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: Record<string, any>;
  timestamp: Date;
  resultCount?: number;
  duration?: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  averageQueryLength: number;
  mostSearchedTerms: Array<{ term: string; count: number }>;
  searchFrequency: Array<{ date: string; count: number }>;
  filterUsage: Record<string, number>;
  averageResultsPerSearch: number;
  noResultQueries: string[];
  popularFilters: Array<{ filter: string; usage: number }>;
}

export interface SearchResult {
  id: string;
  type: 'meter' | 'payment' | 'user' | 'transaction' | 'bill';
  title: string;
  description: string;
  metadata: Record<string, any>;
  relevanceScore?: number;
  highlightedFields?: Record<string, string>;
}

interface SearchContextType {
  // State
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  filters: Record<string, any>;
  history: SearchHistoryItem[];
  analytics: SearchAnalytics;
  isLoading: boolean;
  isSearching: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  performSearch: (query?: string, filters?: Record<string, any>) => Promise<SearchResult[]>;
  clearSearch: () => void;
  updateFilter: (filterId: string, value: any) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  addToHistory: (query: string, filters: Record<string, any>, resultCount: number, duration: number) => void;
  clearHistory: () => void;
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  trackSearchAnalytics: (query: string, resultCount: number, duration: number, filters: Record<string, any>) => void;
  getAnalytics: () => SearchAnalytics;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    totalSearches: 0,
    averageQueryLength: 0,
    mostSearchedTerms: [],
    searchFrequency: [],
    filterUsage: {},
    averageResultsPerSearch: 0,
    noResultQueries: [],
    popularFilters: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedAnalytics = localStorage.getItem('searchAnalytics');
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
    
    if (savedAnalytics) {
      try {
        setAnalytics(JSON.parse(savedAnalytics));
      } catch (error) {
        console.error('Failed to load search analytics:', error);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }
  }, [history]);

  // Save analytics to localStorage
  useEffect(() => {
    localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
  }, [analytics]);

  // Mock search function - in real app, this would call an API
  const performSearch = async (searchQuery?: string, searchFilters?: Record<string, any>): Promise<SearchResult[]> => {
    const actualQuery = searchQuery || query;
    const actualFilters = searchFilters || filters;
    
    if (!actualQuery.trim()) {
      setResults([]);
      return [];
    }

    setIsSearching(true);
    const startTime = Date.now();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results based on query
      const mockResults: SearchResult[] = [];
      const queryLower = actualQuery.toLowerCase();
      
      // Generate mock results based on query content
      if (queryLower.includes('meter') || queryLower.includes('reading')) {
        mockResults.push(
          {
            id: 'meter-1',
            type: 'meter',
            title: 'Meter #METER-001',
            description: 'Current reading: 1,234 kWh | Location: Building A',
            metadata: { meterNumber: 'METER-001', location: 'Building A', reading: 1234 },
            relevanceScore: 0.95
          },
          {
            id: 'meter-2',
            type: 'meter',
            title: 'Meter #METER-002',
            description: 'Current reading: 2,456 kWh | Location: Building B',
            metadata: { meterNumber: 'METER-002', location: 'Building B', reading: 2456 },
            relevanceScore: 0.87
          }
        );
      }
      
      if (queryLower.includes('payment') || queryLower.includes('bill')) {
        mockResults.push(
          {
            id: 'payment-1',
            type: 'payment',
            title: 'Payment #PAY-001',
            description: 'Amount: ₦5,000 | Status: Success | Date: 2024-01-15',
            metadata: { amount: 5000, status: 'SUCCESS', date: '2024-01-15' },
            relevanceScore: 0.92
          },
          {
            id: 'payment-2',
            type: 'payment',
            title: 'Payment #PAY-002',
            description: 'Amount: ₦3,500 | Status: Pending | Date: 2024-01-14',
            metadata: { amount: 3500, status: 'PENDING', date: '2024-01-14' },
            relevanceScore: 0.78
          }
        );
      }
      
      if (queryLower.includes('user') || queryLower.includes('customer')) {
        mockResults.push(
          {
            id: 'user-1',
            type: 'user',
            title: 'John Doe',
            description: 'Customer ID: CUST-001 | Email: john@example.com',
            metadata: { customerId: 'CUST-001', email: 'john@example.com', phone: '+2348012345678' },
            relevanceScore: 0.88
          }
        );
      }
      
      if (queryLower.includes('transaction') || queryLower.includes('history')) {
        mockResults.push(
          {
            id: 'transaction-1',
            type: 'transaction',
            title: 'Transaction #TXN-001',
            description: 'Type: Bill Payment | Amount: ₦5,000 | Status: Completed',
            metadata: { transactionId: 'TXN-001', type: 'BILL_PAYMENT', amount: 5000 },
            relevanceScore: 0.91
          }
        );
      }

      // Add generic result if no specific matches
      if (mockResults.length === 0) {
        mockResults.push({
          id: 'generic-1',
          type: 'bill',
          title: `Results for "${actualQuery}"`,
          description: 'No specific matches found. Try searching for meters, payments, or users.',
          metadata: { query: actualQuery },
          relevanceScore: 0.5
        });
      }

      setResults(mockResults);
      const duration = Date.now() - startTime;
      
      // Track analytics
      trackSearchAnalytics(actualQuery, mockResults.length, duration, actualFilters);
      
      // Add to history
      addToHistory(actualQuery, actualFilters, mockResults.length, duration);
      
      return mockResults;
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Get suggestions based on query
  const getSuggestions = async (searchQuery: string): Promise<SearchSuggestion[]> => {
    if (searchQuery.length < 2) {
      return [];
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const suggestions: SearchSuggestion[] = [];
      const queryLower = searchQuery.toLowerCase();
      
      // Add history suggestions
      const historySuggestions = history
        .filter(item => item.query.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .map(item => ({
          id: `history-${item.id}`,
          text: item.query,
          type: 'history' as const,
          metadata: { timestamp: item.timestamp, resultCount: item.resultCount }
        }));
      
      // Add mock suggestions based on query
      if (queryLower.includes('me')) {
        suggestions.push(
          { id: 'sug-1', text: 'meter readings', type: 'meter' },
          { id: 'sug-2', text: 'meter METER-001', type: 'meter' }
        );
      }
      
      if (queryLower.includes('pa')) {
        suggestions.push(
          { id: 'sug-3', text: 'payment history', type: 'payment' },
          { id: 'sug-4', text: 'pending payments', type: 'payment' }
        );
      }
      
      if (queryLower.includes('us')) {
        suggestions.push(
          { id: 'sug-5', text: 'user accounts', type: 'user' },
          { id: 'sug-6', text: 'user profile', type: 'user' }
        );
      }
      
      if (queryLower.includes('tr')) {
        suggestions.push(
          { id: 'sug-7', text: 'transaction history', type: 'transaction' },
          { id: 'sug-8', text: 'transaction details', type: 'transaction' }
        );
      }
      
      return [...historySuggestions, ...suggestions.slice(0, 5)];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Track search analytics
  const trackSearchAnalytics = (searchQuery: string, resultCount: number, duration: number, searchFilters: Record<string, any>) => {
    setAnalytics(prev => {
      const newAnalytics = { ...prev };
      
      // Update total searches
      newAnalytics.totalSearches += 1;
      
      // Update average query length
      const totalQueryLength = newAnalytics.averageQueryLength * (newAnalytics.totalSearches - 1) + searchQuery.length;
      newAnalytics.averageQueryLength = totalQueryLength / newAnalytics.totalSearches;
      
      // Update most searched terms
      const termIndex = newAnalytics.mostSearchedTerms.findIndex(term => term.term === searchQuery);
      if (termIndex >= 0) {
        newAnalytics.mostSearchedTerms[termIndex].count += 1;
      } else {
        newAnalytics.mostSearchedTerms.push({ term: searchQuery, count: 1 });
      }
      newAnalytics.mostSearchedTerms.sort((a, b) => b.count - a.count);
      newAnalytics.mostSearchedTerms = newAnalytics.mostSearchedTerms.slice(0, 10);
      
      // Update search frequency (today)
      const today = new Date().toISOString().split('T')[0];
      const frequencyIndex = newAnalytics.searchFrequency.findIndex(f => f.date === today);
      if (frequencyIndex >= 0) {
        newAnalytics.searchFrequency[frequencyIndex].count += 1;
      } else {
        newAnalytics.searchFrequency.push({ date: today, count: 1 });
      }
      newAnalytics.searchFrequency.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      newAnalytics.searchFrequency = newAnalytics.searchFrequency.slice(0, 30);
      
      // Update filter usage
      Object.keys(searchFilters).forEach(filterId => {
        newAnalytics.filterUsage[filterId] = (newAnalytics.filterUsage[filterId] || 0) + 1;
      });
      
      // Update average results per search
      const totalResults = newAnalytics.averageResultsPerSearch * (newAnalytics.totalSearches - 1) + resultCount;
      newAnalytics.averageResultsPerSearch = totalResults / newAnalytics.totalSearches;
      
      // Update no result queries
      if (resultCount === 0) {
        if (!newAnalytics.noResultQueries.includes(searchQuery)) {
          newAnalytics.noResultQueries.push(searchQuery);
        }
        newAnalytics.noResultQueries = newAnalytics.noResultQueries.slice(0, 20);
      }
      
      // Update popular filters
      newAnalytics.popularFilters = Object.entries(newAnalytics.filterUsage)
        .map(([filter, usage]) => ({ filter, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);
      
      return newAnalytics;
    });
  };

  // Add to search history
  const addToHistory = (searchQuery: string, searchFilters: Record<string, any>, resultCount: number, duration: number) => {
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: searchQuery,
      filters: { ...searchFilters },
      timestamp: new Date(),
      resultCount,
      duration
    };

    setHistory(prev => {
      // Remove duplicate queries
      const filtered = prev.filter(item => item.query !== searchQuery);
      return [historyItem, ...filtered].slice(0, 50);
    });
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFilters({});
  };

  // Update filter
  const updateFilter = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  // Remove filter
  const removeFilter = (filterId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Get analytics
  const getAnalytics = (): SearchAnalytics => analytics;

  const value: SearchContextType = {
    query,
    results,
    suggestions,
    filters,
    history,
    analytics,
    isLoading,
    isSearching,
    setQuery,
    performSearch,
    clearSearch,
    updateFilter,
    removeFilter,
    clearFilters,
    addToHistory,
    clearHistory,
    getSuggestions,
    trackSearchAnalytics,
    getAnalytics,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
