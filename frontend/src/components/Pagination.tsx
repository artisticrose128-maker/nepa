import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Loader } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  disabled?: boolean;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showJumpToPage?: boolean;
  maxVisiblePages?: number;
  pageSizeOptions?: number[];
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  ariaLabel?: string;
}

interface InfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  disabled?: boolean;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  children?: React.ReactNode;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
}

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

// Custom hook for infinite scroll
export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  threshold = 100,
  rootMargin = '100px',
  disabled = false
}: UseInfiniteScrollOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || !hasNextPage || isFetchingNextPage) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        threshold: 0,
        rootMargin
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, threshold, rootMargin, disabled]);

  return loadMoreRef;
};

// Infinite Scroll Component
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loading = false,
  disabled = false,
  threshold = 100,
  rootMargin = '100px',
  className = '',
  children,
  loader,
  endMessage
}) => {
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    threshold,
    rootMargin,
    disabled
  });

  const defaultLoader = (
    <div className="flex justify-center items-center py-4">
      <Loader className="w-6 h-6 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading more...</span>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-4 text-gray-500">
      <p>No more items to load</p>
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="w-full h-1" />
      
      {/* Loading indicator */}
      {(isFetchingNextPage || loading) && (loader || defaultLoader)}
      
      {/* End message */}
      {!hasNextPage && !isFetchingNextPage && !loading && (endMessage || defaultEndMessage)}
    </div>
  );
};

// Main Pagination Component
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  disabled = false,
  showPageSizeSelector = true,
  showPageInfo = true,
  showJumpToPage = false,
  maxVisiblePages = 7,
  pageSizeOptions = [10, 25, 50, 100, 200],
  variant = 'default',
  className = '',
  ariaLabel = 'Pagination navigation'
}) => {
  const [jumpToPageValue, setJumpToPageValue] = useState('');
  const jumpInputRef = useRef<HTMLInputElement>(null);

  // Generate page numbers to display
  const getVisiblePages = useCallback(() => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page with ellipsis
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push(-1); // Ellipsis
        }
      }

      // Show middle pages
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1); // Ellipsis
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Handle page navigation
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !disabled && !loading) {
      onPageChange(page);
    }
  }, [onPageChange, totalPages, disabled, loading]);

  // Handle jump to page
  const handleJumpToPage = useCallback(() => {
    const page = parseInt(jumpToPageValue);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPageValue('');
      jumpInputRef.current?.blur();
    }
  }, [jumpToPageValue, totalPages, handlePageChange]);

  // Handle keyboard events for jump input
  const handleJumpKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    } else if (e.key === 'Escape') {
      setJumpToPageValue('');
      jumpInputRef.current?.blur();
    }
  }, [handleJumpToPage]);

  // Calculate page info
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const visiblePages = getVisiblePages();

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`} aria-label={ariaLabel}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-700 min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {showPageSizeSelector && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled || loading}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Items per page"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`} aria-label={ariaLabel}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || disabled || loading}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm text-gray-600">
          {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled || loading}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`} aria-label={ariaLabel}>
      {/* Page Info */}
      {showPageInfo && (
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {totalCount} results
          </span>
          {loading && (
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
          )}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Page Size Selector */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <label htmlFor="page-size" className="text-sm text-gray-700">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled || loading}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Items per page"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        )}

        {/* Pagination Controls */}
        <nav className="flex items-center space-x-1" role="navigation" aria-label="Pagination">
          {/* First page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1 || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === -1 ? (
                  <span className="px-3 py-2 text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    disabled={disabled || loading}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages || disabled || loading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Jump to page */}
        {showJumpToPage && totalPages > 5 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="jump-to-page" className="text-sm text-gray-700">
              Go to
            </label>
            <input
              ref={jumpInputRef}
              id="jump-to-page"
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPageValue}
              onChange={(e) => setJumpToPageValue(e.target.value)}
              onKeyDown={handleJumpKeyDown}
              onBlur={handleJumpToPage}
              disabled={disabled || loading}
              className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              aria-label="Jump to page"
              placeholder="Page"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Performance-optimized pagination hook
export const usePaginationPerformance = (data: any[], pageSize: number) => {
  const [visibleData, setVisibleData] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    // Use requestAnimationFrame for smooth updates
    const rafId = requestAnimationFrame(() => {
      const endIndex = startIndex + pageSize;
      setVisibleData(data.slice(startIndex, endIndex));
    });

    return () => cancelAnimationFrame(rafId);
  }, [data, startIndex, pageSize]);

  const updateStartIndex = useCallback((newStartIndex: number) => {
    setStartIndex(newStartIndex);
  }, []);

  return {
    visibleData,
    updateStartIndex,
    startIndex
  };
};

export default Pagination;
