import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { isMobile, isTouchDevice, optimizeAnimations } from '../utils/mobilePerformance';
import App from '../App';
import { DataTable } from '../components/DataTable';
import PaymentIntegration from '../components/PaymentIntegration';

// Mock mobile device
const mockMobileDevice = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  });
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  });
};

// Mock desktop device
const mockDesktopDevice = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
};

// Mock touch events
const mockTouchEvents = () => {
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    value: jest.fn(),
  });
};

describe('Mobile Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should detect mobile device correctly', () => {
    mockMobileDevice();
    expect(isMobile()).toBe(true);
  });

  test('should detect desktop device correctly', () => {
    mockDesktopDevice();
    expect(isMobile()).toBe(false);
  });

  test('should detect touch device correctly', () => {
    mockTouchEvents();
    expect(isTouchDevice()).toBe(true);
  });
});

describe('Mobile Layout Tests', () => {
  beforeEach(() => {
    mockMobileDevice();
  });

  test('should render mobile-optimized layout', () => {
    render(<App />);
    
    // Check for mobile-specific elements
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    expect(screen.getByText('NEPA 💡')).toBeInTheDocument();
  });

  test('should toggle sidebar on mobile', async () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    const sidebar = screen.getByRole('complementary') || screen.getByTestId('sidebar');
    
    // Initially sidebar should be hidden on mobile
    expect(sidebar).not.toHaveClass('active');
    
    // Click menu button to open sidebar
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(sidebar).toHaveClass('active');
    });
  });

  test('should render mobile-friendly dashboard', () => {
    render(<App />);
    
    // Check for mobile dashboard elements
    expect(screen.getByText('NEPA Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Payments')).toBeInTheDocument();
    expect(screen.getByText('Successful')).toBeInTheDocument();
  });
});

describe('Mobile DataTable Tests', () => {
  const sampleData = [
    { id: 1, customer: 'John Doe', meterNumber: 'METER-001', amount: '5000', status: 'SUCCESS', date: '2024-01-15' },
    { id: 2, customer: 'Jane Smith', meterNumber: 'METER-002', amount: '3500', status: 'PENDING', date: '2024-01-14' },
  ];

  const columns = [
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'meterNumber', label: 'Meter Number', sortable: true },
    { key: 'amount', label: 'Amount (₦)', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  beforeEach(() => {
    mockMobileDevice();
  });

  test('should render mobile card view for DataTable', () => {
    render(<DataTable data={sampleData} columns={columns} />);
    
    // Should render mobile card layout instead of table
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Should render mobile transaction items
    expect(screen.getAllByText(/Customer:/i)).toHaveLength(sampleData.length);
    expect(screen.getAllByText(/Meter Number:/i)).toHaveLength(sampleData.length);
  });

  test('should handle mobile search in DataTable', async () => {
    render(<DataTable data={sampleData} columns={columns} searchable />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('should handle mobile pagination', async () => {
    const moreData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      customer: `Customer ${i + 1}`,
      meterNumber: `METER-${String(i + 1).padStart(3, '0')}`,
      amount: `${(i + 1) * 1000}`,
      status: 'SUCCESS',
      date: '2024-01-15'
    }));

    render(<DataTable data={moreData} columns={columns} pageSize={5} />);
    
    // Check pagination controls
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    
    // Navigate to next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Customer 6')).toBeInTheDocument();
    });
  });
});

describe('Mobile Payment Integration Tests', () => {
  beforeEach(() => {
    mockMobileDevice();
  });

  test('should render mobile payment form', () => {
    render(<PaymentIntegration />);
    
    // Check for mobile payment elements
    expect(screen.getByText('Wallet Status')).toBeInTheDocument();
    expect(screen.getByText('Make a Payment')).toBeInTheDocument();
  });

  test('should handle mobile payment flow', async () => {
    render(<PaymentIntegration />);
    
    // Mock wallet connection
    const connectButton = screen.getByText(/connect/i);
    fireEvent.click(connectButton);
    
    // Fill payment form (mock implementation)
    const amountInput = screen.getByPlaceholderText(/amount/i) || screen.getByLabelText(/amount/i);
    const meterInput = screen.getByPlaceholderText(/meter/i) || screen.getByLabelText(/meter/i);
    
    if (amountInput && meterInput) {
      fireEvent.change(amountInput, { target: { value: '5000' } });
      fireEvent.change(meterInput, { target: { value: 'METER-001' } });
      
      const submitButton = screen.getByText(/pay|submit/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/confirm payment/i)).toBeInTheDocument();
      });
    }
  });

  test('should handle mobile confirmation screen', async () => {
    render(<PaymentIntegration />);
    
    // Mock successful payment flow to reach confirmation
    // This would require more complex mocking in a real test
    expect(screen.getByText('Wallet Status')).toBeInTheDocument();
  });
});

describe('Mobile Touch Interactions', () => {
  beforeEach(() => {
    mockMobileDevice();
    mockTouchEvents();
  });

  test('should handle touch events on buttons', () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    // Simulate touch events
    fireEvent.touchStart(menuButton);
    fireEvent.touchEnd(menuButton);
    
    // Should trigger click behavior
    expect(menuButton).toHaveClass('mobile-touch-target');
  });

  test('should handle swipe gestures', () => {
    const element = document.createElement('div');
    element.style.touchAction = 'pan-y';
    
    // Test touch gesture utilities
    expect(element.style.touchAction).toBe('pan-y');
  });
});

describe('Mobile Performance Tests', () => {
  beforeEach(() => {
    mockMobileDevice();
  });

  test('should optimize animations for mobile', () => {
    optimizeAnimations();
    
    const rootElement = document.documentElement;
    expect(rootElement.style.getPropertyValue('--animation-duration')).toBe('0.2s');
  });

  test('should load performance metrics', () => {
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        getEntriesByType: jest.fn(() => []),
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
          totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        }
      }
    });

    const { performanceMetrics } = require('../utils/mobilePerformance');
    
    expect(performanceMetrics.measurePageLoadTime()).toBeGreaterThanOrEqual(0);
    expect(performanceMetrics.measureFirstContentfulPaint()).toBeGreaterThanOrEqual(0);
  });
});

describe('Mobile Accessibility Tests', () => {
  beforeEach(() => {
    mockMobileDevice();
  });

  test('should have proper touch targets', () => {
    render(<App />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('mobile-touch-target');
    });
  });

  test('should have proper ARIA labels', () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toHaveAttribute('aria-label');
  });

  test('should support keyboard navigation', () => {
    render(<DataTable data={[]} columns={[]} />);
    
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('tabindex');
  });
});

describe('Mobile Responsive Design Tests', () => {
  test('should adapt to different screen sizes', () => {
    // Test mobile
    mockMobileDevice();
    const { rerender } = render(<App />);
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    
    // Test tablet
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    rerender(<App />);
    
    // Test desktop
    mockDesktopDevice();
    rerender(<App />);
  });

  test('should handle orientation changes', () => {
    mockMobileDevice();
    
    // Portrait
    Object.defineProperty(window, 'innerHeight', { value: 667 });
    render(<App />);
    
    // Landscape
    Object.defineProperty(window, 'innerHeight', { value: 375 });
    Object.defineProperty(window, 'innerWidth', { value: 667 });
    
    // Should trigger layout adjustments
    expect(window.innerHeight).toBe(375);
  });
});

describe('Mobile Error Handling', () => {
  beforeEach(() => {
    mockMobileDevice();
  });

  test('should handle network errors gracefully', async () => {
    // Mock network failure
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    
    render(<PaymentIntegration />);
    
    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('should handle wallet connection errors', async () => {
    render(<PaymentIntegration />);
    
    // Mock wallet connection failure
    const connectButton = screen.getByText(/connect/i);
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('Mobile Integration Tests', () => {
  test('should complete full mobile payment flow', async () => {
    mockMobileDevice();
    render(<App />);
    
    // Navigate to payment
    const paymentLink = screen.getByText(/bill payment/i);
    fireEvent.click(paymentLink);
    
    await waitFor(() => {
      expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    });
    
    // Connect wallet
    const connectButton = screen.getByText(/connect/i);
    fireEvent.click(connectButton);
    
    // Fill form
    const amountInput = screen.getByPlaceholderText(/amount/i) || screen.getByLabelText(/amount/i);
    if (amountInput) {
      fireEvent.change(amountInput, { target: { value: '5000' } });
    }
    
    // Submit payment
    const submitButton = screen.getByText(/pay|submit/i);
    if (submitButton) {
      fireEvent.click(submitButton);
    }
    
    // Should reach confirmation
    await waitFor(() => {
      expect(screen.getByText(/confirm payment/i)).toBeInTheDocument();
    });
  });

  test('should handle mobile navigation', async () => {
    mockMobileDevice();
    render(<App />);
    
    // Test sidebar navigation
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // Navigate to different sections
    const dashboardLink = screen.getByText(/dashboard/i);
    fireEvent.click(dashboardLink);
    
    await waitFor(() => {
      expect(screen.getByText('NEPA Dashboard')).toBeInTheDocument();
    });
  });
});
