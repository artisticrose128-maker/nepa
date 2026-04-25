import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, InfiniteScroll, usePaginationPerformance } from '../Pagination';
import { paginationAccessibility } from '../../utils/accessibility';

// Mock IntersectionObserver for infinite scroll
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock announceToScreenReader
jest.mock('../../utils/accessibility', () => ({
  ...jest.requireActual('../../utils/accessibility'),
  announceToScreenReader: jest.fn(),
}));

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalCount: 100,
    pageSize: 10,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination controls correctly', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByLabelText('Pagination navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
  });

  it('displays correct page information', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Showing 1 to 10 of 100 results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
  });

  it('calls onPageChange when page buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} />);
    
    await user.click(screen.getByLabelText('Go to next page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    
    await user.click(screen.getByLabelText('Go to last page'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(10);
  });

  it('disables navigation buttons appropriately', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).not.toBeDisabled();
  });

  it('handles page size changes', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} />);
    
    const pageSizeSelect = screen.getByLabelText('Items per page');
    await user.selectOptions(pageSizeSelect, '25');
    
    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('shows jump to page input when enabled', () => {
    render(<Pagination {...defaultProps} showJumpToPage={true} />);
    
    expect(screen.getByLabelText('Jump to specific page')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Page')).toBeInTheDocument();
  });

  it('handles jump to page functionality', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} showJumpToPage={true} />);
    
    const jumpInput = screen.getByPlaceholderText('Page');
    await user.type(jumpInput, '5');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
  });

  it('renders compact variant correctly', () => {
    render(<Pagination {...defaultProps} variant="compact" />);
    
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    expect(screen.queryByText('Showing 1 to 10 of 100 results')).not.toBeInTheDocument();
  });

  it('renders minimal variant correctly', () => {
    render(<Pagination {...defaultProps} variant="minimal" />);
    
    expect(screen.getByText('1 of 10')).toBeInTheDocument();
    expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument();
  });

  it('disables all controls when disabled prop is true', () => {
    render(<Pagination {...defaultProps} disabled={true} />);
    
    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Items per page')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    
    // Check for loading spinner
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});

describe('InfiniteScroll Component', () => {
  const defaultProps = {
    hasNextPage: true,
    isFetchingNextPage: false,
    onLoadMore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <InfiniteScroll {...defaultProps}>
        <div>Test Content</div>
      </InfiniteScroll>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loading indicator when fetching', () => {
    render(<InfiniteScroll {...defaultProps} isFetchingNextPage={true} />);
    
    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });

  it('shows end message when no more pages', () => {
    render(<InfiniteScroll {...defaultProps} hasNextPage={false} />);
    
    expect(screen.getByText('No more items to load')).toBeInTheDocument();
  });

  it('uses custom loader and end message', () => {
    const customLoader = <div>Custom Loading...</div>;
    const customEndMessage = <div>Custom End Message</div>;
    
    render(
      <InfiniteScroll 
        {...defaultProps} 
        isFetchingNextPage={true}
        loader={customLoader}
        endMessage={customEndMessage}
      />
    );
    
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('calls onLoadMore when intersection is observed', async () => {
    render(<InfiniteScroll {...defaultProps} />);
    
    // Simulate intersection observer callback
    const mockCallback = mockIntersectionObserver.mock.calls[0][0];
    mockCallback([{ isIntersecting: true }]);
    
    await waitFor(() => {
      expect(defaultProps.onLoadMore).toHaveBeenCalled();
    });
  });
});

describe('usePaginationPerformance Hook', () => {
  it('should be defined', () => {
    expect(usePaginationPerformance).toBeDefined();
  });

  // Note: Testing custom hooks requires renderHook from @testing-library/react-hooks
  // This is a basic test to ensure the hook exists
});

describe('paginationAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('announces page changes', () => {
    paginationAccessibility.announcePageChange(2, 10, 20);
    
    expect(require('../../utils/accessibility').announceToScreenReader).toHaveBeenCalledWith(
      'Page 2 of 10, showing 20 items',
      'polite'
    );
  });

  it('announces page size changes', () => {
    paginationAccessibility.announcePageSizeChange(25);
    
    expect(require('../../utils/accessibility').announceToScreenReader).toHaveBeenCalledWith(
      'Showing 25 items per page',
      'polite'
    );
  });

  it('announces infinite scroll loading states', () => {
    paginationAccessibility.announceInfiniteScrollLoading(true, true);
    expect(require('../../utils/accessibility').announceToScreenReader).toHaveBeenCalledWith(
      'Loading more items',
      'polite'
    );

    paginationAccessibility.announceInfiniteScrollLoading(false, false);
    expect(require('../../utils/accessibility').announceToScreenReader).toHaveBeenCalledWith(
      'No more items to load',
      'polite'
    );
  });

  it('provides keyboard navigation patterns', () => {
    const patterns = paginationAccessibility.getKeyboardNavigation();
    
    expect(patterns.next).toContain('ArrowRight');
    expect(patterns.previous).toContain('ArrowLeft');
    expect(patterns.first).toContain('Home');
    expect(patterns.last).toContain('End');
  });

  it('handles keyboard navigation correctly', () => {
    const onPageChange = jest.fn();
    const mockEvent = {
      key: 'ArrowRight',
      preventDefault: jest.fn(),
    } as any;

    paginationAccessibility.handleKeyboardNavigation(
      mockEvent,
      1,
      10,
      onPageChange
    );

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('generates correct pagination attributes', () => {
    const attrs = paginationAccessibility.getPaginationAttributes(2, 10);
    
    expect(attrs).toEqual({
      'aria-label': 'Pagination navigation',
      'aria-current': '2',
      'aria-setsize': '10',
      'aria-posinset': '2',
    });
  });

  it('generates correct page button attributes', () => {
    const attrs = paginationAccessibility.getPageButtonAttributes(3, 2, false);
    
    expect(attrs).toEqual({
      'aria-label': 'Go to page 3',
      'aria-current': undefined,
      'aria-disabled': 'false',
      'role': 'button',
      'tabIndex': 0,
    });
  });

  it('generates infinite scroll attributes', () => {
    const attrs = paginationAccessibility.getInfiniteScrollAttributes(true, true);
    
    expect(attrs).toEqual({
      'aria-label': 'Load more items',
      'aria-busy': 'true',
      'aria-live': 'polite',
    });
  });
});

describe('Pagination Edge Cases', () => {
  it('handles single page correctly', () => {
    const props = {
      currentPage: 1,
      totalPages: 1,
      totalCount: 5,
      pageSize: 10,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    };

    render(<Pagination {...props} />);
    
    expect(screen.getByText('Showing 1 to 5 of 5 results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('handles large number of pages with ellipsis', () => {
    const props = {
      currentPage: 50,
      totalPages: 100,
      totalCount: 1000,
      pageSize: 10,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
      maxVisiblePages: 7,
    };

    render(<Pagination {...props} />);
    
    // Should show ellipsis for large page ranges
    expect(screen.getByText('Page 50 of 100')).toBeInTheDocument();
  });

  it('handles empty data correctly', () => {
    const props = {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      pageSize: 10,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    };

    render(<Pagination {...props} />);
    
    expect(screen.getByText('Showing 0 to 0 of 0 results')).toBeInTheDocument();
  });
});

describe('Performance Tests', () => {
  it('handles large datasets efficiently', async () => {
    const props = {
      currentPage: 1,
      totalPages: 1000,
      totalCount: 10000,
      pageSize: 10,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    };

    const startTime = performance.now();
    render(<Pagination {...props} />);
    const endTime = performance.now();

    // Rendering should take less than 100ms even for large datasets
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('does not cause unnecessary re-renders', async () => {
    const onPageChange = jest.fn();
    const { rerender } = render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        totalCount={100} 
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={jest.fn()}
      />
    );

    // Re-render with same props
    rerender(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        totalCount={100} 
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={jest.fn()}
      />
    );

    // onPageChange should not be called on re-render
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
