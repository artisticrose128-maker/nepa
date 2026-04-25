import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction, TransactionHistory, TransactionFilters, PaymentStatus } from '../types';
import TransactionService from '../services/transactionService';
import { Loading } from './Loading';
import BookmarkService from '../services/bookmarkService';
import { Star, Trash2, CheckCircle, FileText, Download } from 'lucide-react';
import { AdvancedDataTable } from './AdvancedDataTable';
import { Pagination, InfiniteScroll, usePaginationPerformance } from './Pagination';
import { paginationAccessibility } from '../utils/accessibility';

interface Props {
  className?: string;
}

export const TransactionHistoryComponent: React.FC<Props> = ({ className = '' }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
  });
  const [pageSize, setPageSize] = useState(10);
  const [paginationMode, setPaginationMode] = useState<'traditional' | 'infinite'>('traditional');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  
  // Performance optimization for large datasets
  const { visibleData, updateStartIndex } = usePaginationPerformance(transactions, pageSize);
  const paginationRef = useRef<HTMLDivElement>(null);

  // Check bookmarks on mount
  useEffect(() => {
    const bookmarks = BookmarkService.getBookmarks();
    setBookmarkedIds(new Set(bookmarks.map(b => b.id)));
  }, []);

  // Load transactions on component mount and filter changes
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async (resetPage: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset to page 1 if filters changed
      const currentFilters = resetPage ? { ...filters, page: 1, limit: pageSize } : { ...filters, page: pagination.currentPage, limit: pageSize };
      
      const result: TransactionHistory = await TransactionService.getTransactionHistory(currentFilters);
      
      if (paginationMode === 'infinite' && !resetPage) {
        // Append for infinite scroll
        setTransactions(prev => [...prev, ...result.transactions]);
      } else {
        // Replace for traditional pagination or reset
        setTransactions(result.transactions);
      }
      
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
      });

      // Announce page change for accessibility
      paginationAccessibility.announcePageChange(result.currentPage, result.totalPages, result.transactions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: key === 'page' ? value : 1, // Reset to page 1 when filters change
      limit: pageSize,
    }));
  };

  // Enhanced pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setFilters(prev => ({ ...prev, limit: newPageSize, page: 1 }));
    paginationAccessibility.announcePageSizeChange(newPageSize);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNextPage && !isFetchingNextPage && paginationMode === 'infinite') {
      setIsFetchingNextPage(true);
      const nextPage = pagination.currentPage + 1;
      setPagination(prev => ({ ...prev, currentPage: nextPage }));
      setFilters(prev => ({ ...prev, page: nextPage }));
      loadTransactions(false);
    }
  }, [pagination.hasNextPage, isFetchingNextPage, paginationMode, pagination.currentPage]);

  const handlePaginationModeChange = useCallback((mode: 'traditional' | 'infinite') => {
    setPaginationMode(mode);
    setTransactions([]); // Reset transactions
    loadTransactions(true); // Reload with new mode
  }, []);

  // Keyboard navigation for pagination
  const handlePaginationKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (paginationRef.current) {
      paginationAccessibility.handleKeyboardNavigation(
        event.nativeEvent,
        pagination.currentPage,
        pagination.totalPages,
        handlePageChange
      );
    }
  }, [pagination.currentPage, pagination.totalPages, handlePageChange]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      setSearchLoading(true);
      TransactionService.searchTransactions(searchTerm, filters)
        .then(result => {
          setTransactions(result.transactions);
          setPagination({
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalCount: result.totalCount,
            hasNextPage: result.hasNextPage,
          });
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Search failed'))
        .finally(() => setSearchLoading(false));
    } else {
      loadTransactions();
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      await TransactionService.downloadReceiptPDF(transactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download receipt');
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      await TransactionService.exportToCSV(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export transactions');
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewReceipt = async (transaction: Transaction) => {
    try {
      const receipt = await TransactionService.generateReceipt(transaction.id);
      setSelectedTransaction(transaction);
      setShowReceiptModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    }
  };

  const handleToggleBookmark = (transaction: Transaction) => {
    const isBookmarked = BookmarkService.toggleBookmark({
      id: transaction.id,
      type: 'transaction',
      title: `Transaction ${transaction.id}`,
      data: transaction
    });
    
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isBookmarked) {
        next.add(transaction.id);
      } else {
        next.delete(transaction.id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({ limit: pageSize });
    setTransactions([]); // Reset for infinite scroll
  };

  const filteredTransactions = useMemo(() => transactions, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <Loading size="lg" label="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600 mt-1">
            {pagination.totalCount} transaction{pagination.totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters((prev: boolean) => !prev)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={loading || exportLoading || transactions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {exportLoading ? (
              <>
                <Loading size="sm" />
                Exporting...
              </>
            ) : (
              'Export CSV'
            )}
          </button>

          {/* Pagination Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handlePaginationModeChange('traditional')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                paginationMode === 'traditional'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Traditional
            </button>
            <button
              onClick={() => handlePaginationModeChange('infinite')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                paginationMode === 'infinite'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Infinite Scroll
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Meter ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meter ID</label>
              <input
                type="text"
                placeholder="METER-123"
                value={filters.meterId || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('meterId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PROCESSING">Processing</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount (₦)</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount (₦)</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.maxAmount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by transaction ID, meter ID, or amount..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          {searchLoading && (
            <div className="absolute right-3 top-3.5">
              <Loading size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {paginationMode === 'infinite' ? (
        <InfiniteScroll
          hasNextPage={pagination.hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
          loading={loading}
          disabled={loading}
          threshold={200}
          className="bg-white rounded-lg shadow overflow-hidden"
          loader={
            <div className="flex justify-center items-center py-8">
              <Loading size="md" label="Loading more transactions..." />
            </div>
          }
          endMessage={
            <div className="text-center py-8 border-t border-gray-200">
              <div className="text-gray-500">End of transaction history</div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meter ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {TransactionService.formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono text-xs">{transaction.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.meterId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {TransactionService.formatAmount(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TransactionService.getStatusColor(transaction.status)}`}>
                        <span className="mr-1">{TransactionService.getStatusIcon(transaction.status)}</span>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewReceipt(transaction)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Receipt
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(transaction.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Download PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfiniteScroll>
      ) : (
        <>
          {loading && transactions.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <Loading size="md" label="Updating transactions..." />
            </div>
          )}
          
          {filteredTransactions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No transactions found</div>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meter ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {TransactionService.formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-mono text-xs">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.meterId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {TransactionService.formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TransactionService.getStatusColor(transaction.status)}`}>
                            <span className="mr-1">{TransactionService.getStatusIcon(transaction.status)}</span>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewReceipt(transaction)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Receipt
                            </button>
                            <button
                              onClick={() => handleDownloadReceipt(transaction.id)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Download PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Pagination */}
      {paginationMode === 'traditional' && pagination.totalPages > 1 && (
        <div ref={paginationRef} onKeyDown={handlePaginationKeyDown}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            disabled={loading}
            showPageSizeSelector={true}
            showPageInfo={true}
            showJumpToPage={true}
            maxVisiblePages={7}
            pageSizeOptions={[10, 25, 50, 100, 200]}
            ariaLabel="Transaction history pagination"
          />
        </div>
      )}
      {/* Transactions Table */}
      <TransactionHistoryTable 
        transactions={transactions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page: number) => handleFilterChange('page', page)}
        onViewReceipt={handleViewReceipt}
        onDownloadPDF={handleDownloadReceipt}
        onToggleBookmark={handleToggleBookmark}
        bookmarkedIds={bookmarkedIds}
      />

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-900">NEPA Payment Receipt</h4>
                <p className="text-gray-600">Receipt #: {selectedTransaction.id}</p>
              </div>
              
              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="text-sm">{TransactionService.formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meter ID</p>
                  <p className="text-sm">{selectedTransaction.meterId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {TransactionService.formatAmount(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TransactionService.getStatusColor(selectedTransaction.status)}`}>
                    <span className="mr-1">{TransactionService.getStatusIcon(selectedTransaction.status)}</span>
                    {selectedTransaction.status}
                  </span>
                </div>
                {selectedTransaction.transactionHash && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Transaction Hash</p>
                    <p className="font-mono text-xs break-all">{selectedTransaction.transactionHash}</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <button
                  onClick={() => handleDownloadReceipt(selectedTransaction.id)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF Receipt
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Transaction List integrated with AdvancedDataTable
export const TransactionHistoryTable: React.FC<{
  transactions: Transaction[];
  loading: boolean;
  pagination: any;
  onPageChange: (page: number) => void;
  onViewReceipt: (t: Transaction) => void;
  onDownloadPDF: (id: string) => void;
  onToggleBookmark: (t: Transaction) => void;
  bookmarkedIds: Set<string>;
}> = ({ 
  transactions, 
  loading, 
  pagination, 
  onPageChange, 
  onViewReceipt, 
  onDownloadPDF, 
  onToggleBookmark,
  bookmarkedIds
}) => {
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);

  const columns = [
    { 
      key: 'date', 
      label: 'Date & Time', 
      sortable: true,
      render: (value: string) => TransactionService.formatDate(value)
    },
    { 
      key: 'id', 
      label: 'Transaction ID', 
      render: (value: string) => <span className="font-mono text-xs">{value}</span>
    },
    { key: 'meterId', label: 'Meter ID', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{TransactionService.formatAmount(value)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value: PaymentStatus) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TransactionService.getStatusColor(value)}`}>
          <span className="mr-1">{TransactionService.getStatusIcon(value)}</span>
          {value}
        </span>
      )
    },
    {
      key: 'bookmark',
      label: 'Bookmark',
      render: (_: any, row: Transaction) => (
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleBookmark(row);
          }}
          className={`transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 ${
            bookmarkedIds.has(row.id) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
          }`}
        >
          <Star className="w-5 h-5" />
        </button>
      )
    }
  ];

  const actions = [
    {
      key: 'view',
      label: 'View Receipt',
      icon: <FileText className="w-4 h-4" />,
      onClick: (row: Transaction) => onViewReceipt(row)
    },
    {
      key: 'download',
      label: 'Download PDF',
      icon: <Download className="w-4 h-4" />,
      onClick: (row: Transaction) => onDownloadPDF(row.id)
    }
  ];

  const bulkActions = [
    {
      key: 'bulk-delete',
      label: 'Delete Selected',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: (rows: Transaction[]) => {
        if (confirm(`Are you sure you want to delete ${rows.length} transactions?`)) {
          console.log('Deleting rows:', rows.map(r => r.id));
          // In a real app, call service.deleteTransactions(ids)
        }
      }
    },
    {
      key: 'bulk-bookmark',
      label: 'Bookmark All',
      icon: <Star className="w-4 h-4" />,
      onClick: (rows: Transaction[]) => {
        rows.forEach(row => {
          if (!bookmarkedIds.has(row.id)) {
            onToggleBookmark(row);
          }
        });
      }
    },
    {
      key: 'bulk-success',
      label: 'Mark as Success',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (rows: Transaction[]) => {
        console.log('Marking as success:', rows.map(r => r.id));
      }
    }
  ];

  return (
    <AdvancedDataTable
      data={transactions}
      columns={columns}
      actions={actions}
      loading={loading}
      selection={{
        selectedRows,
        onSelectionChange: setSelectedRows
      }}
      bulkActions={bulkActions}
      pagination={{
        page: pagination.currentPage,
        pageSize: 10,
        total: pagination.totalCount,
        onPageChange: onPageChange,
        onPageSizeChange: (size: number) => console.log('Page size change:', size)
      }}
      emptyMessage="No transactions found matching your criteria."
    />
  );
};
