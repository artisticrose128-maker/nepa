// Accessibility utilities for WCAG 2.1 AA compliance

/**
 * Generates a unique ID for accessibility purposes
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ARIA label generators
 */
export const ariaLabels = {
  // Navigation
  menuToggle: 'Toggle navigation menu',
  themeToggle: 'Toggle color theme between light, dark, and system preference',
  
  // Dashboard
  totalSpent: 'Total amount spent on utility bills',
  avgMonthlyBill: 'Average monthly utility bill amount',
  pendingBills: 'Number of pending utility bills',
  successRate: 'Percentage of successful utility payments',
  
  // Charts
  usageChart: 'Monthly utility consumption and cost chart',
  budgetChart: 'Budget allocation and spending overview',
  consumptionTrend: 'Daily consumption pattern chart',
  
  // Forms
  searchInput: 'Search payments by meter ID or payment type',
  filterSelect: 'Filter payments by status',
  
  // Tables
  paymentTable: 'Payment history table',
  sortColumn: 'Sort table by this column',
  
  // Interactive elements
  expandDetails: 'Expand payment details',
  collapseDetails: 'Collapse payment details',
  viewMore: 'View more payment details',
  
  // Pagination
  pagination: 'Pagination navigation',
  firstPage: 'Go to first page',
  lastPage: 'Go to last page',
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  currentPage: 'Current page',
  pageButton: (page: number) => `Go to page ${page}`,
  pageSizeSelector: 'Select number of items per page',
  jumpToPage: 'Jump to specific page',
  infiniteScrollLoad: 'Load more items',
  infiniteScrollEnd: 'No more items to load',
};

/**
 * Role definitions for landmarks
 */
export const landmarkRoles = {
  main: 'main',
  navigation: 'navigation',
  banner: 'banner',
  contentinfo: 'contentinfo',
  search: 'search',
  complementary: 'complementary',
  region: 'region',
};

/**
 * Common ARIA attributes
 */
export const getAriaAttributes = {
  // For expandable content
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded.toString() }),
  
  // For selected items
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected.toString() }),
  
  // For disabled elements
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled.toString() }),
  
  // For required fields
  required: (isRequired: boolean) => ({ 'aria-required': isRequired.toString() }),
  
  // For invalid fields
  invalid: (isInvalid: boolean) => ({ 'aria-invalid': isInvalid.toString() }),
  
  // For busy elements
  busy: (isBusy: boolean) => ({ 'aria-busy': isBusy.toString() }),
};

/**
 * Keyboard navigation helpers
 */
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a container
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === keyboardKeys.TAB) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
  
  /**
   * Set focus to an element safely
   */
  setFocus: (element: HTMLElement | null) => {
    if (element) {
      requestAnimationFrame(() => {
        element.focus();
      });
    }
  },
};

/**
 * Screen reader announcements
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Check if text meets WCAG AA contrast requirements
   */
  meetsAA: (foreground: string, background: string, fontSize: number = 16): boolean => {
    // This is a simplified check - in production, use a proper contrast calculation library
    const contrast = calculateContrast(foreground, background);
    const threshold = fontSize >= 18 ? 3 : 4.5;
    return contrast >= threshold;
  },
  
  /**
   * Get appropriate text color based on background
   */
  getTextColor: (backgroundColor: string): 'light' | 'dark' => {
    // Simplified logic - use proper color analysis in production
    const rgb = hexToRgb(backgroundColor);
    if (!rgb) return 'dark';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? 'dark' : 'light';
  },
};

/**
 * Helper functions (simplified versions - use proper libraries in production)
 */
function calculateContrast(foreground: string, background: string): number {
  // Simplified contrast calculation
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return 1;
  
  const fgLuminance = calculateLuminance(fgRgb);
  const bgLuminance = calculateLuminance(bgRgb);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Skip link functionality
 */
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring z-50';
  skipLink.setAttribute('aria-label', text);
  
  return skipLink;
};

/**
 * Reduced motion detection
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * High contrast mode detection
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Pagination accessibility utilities
 */
export const paginationAccessibility = {
  /**
   * Announce page change to screen readers
   */
  announcePageChange: (currentPage: number, totalPages: number, itemCount?: number) => {
    let message = `Page ${currentPage} of ${totalPages}`;
    if (itemCount !== undefined) {
      message += `, showing ${itemCount} items`;
    }
    announceToScreenReader(message, 'polite');
  },

  /**
   * Announce page size change
   */
  announcePageSizeChange: (pageSize: number) => {
    announceToScreenReader(`Showing ${pageSize} items per page`, 'polite');
  },

  /**
   * Announce loading state for infinite scroll
   */
  announceInfiniteScrollLoading: (isLoading: boolean, hasMore: boolean) => {
    if (isLoading) {
      announceToScreenReader('Loading more items', 'polite');
    } else if (!hasMore) {
      announceToScreenReader('No more items to load', 'polite');
    }
  },

  /**
   * Get keyboard navigation pattern for pagination
   */
  getKeyboardNavigation: () => ({
    next: [keyboardKeys.ARROW_RIGHT, keyboardKeys.PAGE_DOWN],
    previous: [keyboardKeys.ARROW_LEFT, keyboardKeys.PAGE_UP],
    first: [keyboardKeys.HOME],
    last: [keyboardKeys.END],
    jump: [keyboardKeys.ENTER],
  }),

  /**
   * Handle keyboard navigation for pagination
   */
  handleKeyboardNavigation: (
    event: KeyboardEvent,
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    const { next, previous, first, last } = paginationAccessibility.getKeyboardNavigation();
    
    if (next.includes(event.key)) {
      event.preventDefault();
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    } else if (previous.includes(event.key)) {
      event.preventDefault();
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    } else if (first.includes(event.key)) {
      event.preventDefault();
      if (currentPage !== 1) {
        onPageChange(1);
      }
    } else if (last.includes(event.key)) {
      event.preventDefault();
      if (currentPage !== totalPages) {
        onPageChange(totalPages);
      }
    }
  },

  /**
   * Generate ARIA attributes for pagination controls
   */
  getPaginationAttributes: (currentPage: number, totalPages: number) => ({
    'aria-label': ariaLabels.pagination,
    'aria-current': currentPage.toString(),
    'aria-setsize': totalPages.toString(),
    'aria-posinset': currentPage.toString(),
  }),

  /**
   * Generate ARIA attributes for page buttons
   */
  getPageButtonAttributes: (page: number, currentPage: number, isDisabled: boolean = false) => ({
    'aria-label': ariaLabels.pageButton(page),
    'aria-current': page === currentPage ? 'page' : undefined,
    'aria-disabled': isDisabled.toString(),
    'role': 'button',
    'tabIndex': isDisabled ? -1 : 0,
  }),

  /**
   * Generate ARIA attributes for infinite scroll
   */
  getInfiniteScrollAttributes: (isLoading: boolean, hasMore: boolean) => ({
    'aria-label': ariaLabels.infiniteScrollLoad,
    'aria-busy': isLoading.toString(),
    'aria-live': hasMore ? 'polite' : 'off',
  }),
};
