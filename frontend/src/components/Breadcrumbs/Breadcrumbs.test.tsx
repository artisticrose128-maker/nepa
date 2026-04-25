import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Breadcrumbs from './Breadcrumbs';
import BreadcrumbProvider from './BreadcrumbProvider';
import { useBreadcrumbs } from './BreadcrumbProvider';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock useTranslation
jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock react-router-dom
const mockLocation = { pathname: '/dashboard/analytics' };
jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumbs Component', () => {
  const mockConfig = {
    routes: {
      '': { id: 'home', label: 'Home', href: '/' },
      'dashboard': { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      'analytics': { id: 'analytics', label: 'Analytics', href: '/analytics' }
    }
  };

  beforeEach(() => {
    mockLocation.pathname = '/dashboard/analytics';
  });

  test('renders breadcrumbs with correct items', () => {
    render(<Breadcrumbs config={mockConfig} />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  test('does not render when hideOnSingleItem is true and only one item', () => {
    mockLocation.pathname = '/dashboard';
    
    render(<Breadcrumbs config={mockConfig} options={{ hideOnSingleItem: true }} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('breadcrumbs--hidden');
  });

  test('renders dropdown when items exceed maxItems', () => {
    const manyRoutesConfig = {
      routes: {
        '': { id: 'home', label: 'Home', href: '/' },
        'dashboard': { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        'analytics': { id: 'analytics', label: 'Analytics', href: '/analytics' },
        'transactions': { id: 'transactions', label: 'Transactions', href: '/transactions' },
        'profile': { id: 'profile', label: 'Profile', href: '/profile' },
        'settings': { id: 'settings', label: 'Settings', href: '/settings' }
      }
    };
    
    render(<Breadcrumbs config={manyRoutesConfig} options={{ maxItems: 3 }} />);
    
    expect(screen.getByText(/more/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /more/ })).toBeInTheDocument();
  });

  test('calls onItemClick when breadcrumb is clicked', async () => {
    const mockOnItemClick = jest.fn();
    
    render(<Breadcrumbs config={mockConfig} onItemClick={mockOnItemClick} />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    await userEvent.click(dashboardLink);
    
    expect(mockOnItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dashboard', label: 'Dashboard' })
    );
  });

  test('applies custom className', () => {
    render(<Breadcrumbs config={mockConfig} className="custom-breadcrumb" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-breadcrumb');
  });

  test('uses custom ariaLabel', () => {
    render(<Breadcrumbs config={mockConfig} ariaLabel="Custom navigation" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Custom navigation');
  });

  test('renders with custom separator', () => {
    render(<Breadcrumbs config={mockConfig} options={{ customSeparator: '>' }} />);
    
    const separators = screen.getAllByText('>');
    expect(separators.length).toBeGreaterThan(0);
  });

  test('hides home icon when showHomeIcon is false', () => {
    render(<Breadcrumbs config={mockConfig} options={{ showHomeIcon: false }} />);
    
    expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
  });

  test('renders with custom items', () => {
    const customItems = [
      { id: 'custom1', label: 'Custom Page 1', href: '/custom1' },
      { id: 'custom2', label: 'Custom Page 2', href: '/custom2' }
    ];
    
    render(<Breadcrumbs items={customItems} />);
    
    expect(screen.getByText('Custom Page 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Page 2')).toBeInTheDocument();
  });

  test('marks last item as active', () => {
    render(<Breadcrumbs config={mockConfig} />);
    
    const activeItem = screen.getByText('Analytics');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(activeItem.closest('li')).toHaveClass('breadcrumb-item--active');
  });

  test('includes structured data for SEO', () => {
    render(<Breadcrumbs config={mockConfig} />);
    
    // Check for structured data script
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
    
    // Check for microdata
    const metaTags = document.querySelectorAll('meta[itemScope]');
    expect(metaTags.length).toBeGreaterThan(0);
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<Breadcrumbs config={mockConfig} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('supports keyboard navigation', async () => {
    render(<Breadcrumbs config={mockConfig} />);
    
    const links = screen.getAllByRole('link');
    
    // Tab to first link
    await userEvent.tab();
    expect(links[0]).toHaveFocus();
    
    // Tab through links
    for (let i = 1; i < links.length; i++) {
      await userEvent.tab();
      expect(links[i]).toHaveFocus();
    }
  });

  test('handles empty path', () => {
    mockLocation.pathname = '/';
    
    render(<Breadcrumbs config={mockConfig} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    const homeItem = screen.getByText('Home');
    expect(homeItem).toHaveAttribute('aria-current', 'page');
  });

  test('handles dynamic routes', () => {
    mockLocation.pathname = '/user/123/profile';
    
    const dynamicConfig = {
      routes: {
        '': { id: 'home', label: 'Home', href: '/' },
        'user': { id: 'user', label: 'User', href: '/user' }
      }
    };
    
    render(<Breadcrumbs config={dynamicConfig} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('renders dropdown menu correctly', async () => {
    const manyRoutesConfig = {
      routes: {
        '': { id: 'home', label: 'Home', href: '/' },
        'dashboard': { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        'analytics': { id: 'analytics', label: 'Analytics', href: '/analytics' },
        'transactions': { id: 'transactions', label: 'Transactions', href: '/transactions' },
        'profile': { id: 'profile', label: 'Profile', href: '/profile' },
        'settings': { id: 'settings', label: 'Settings', href: '/settings' }
      }
    };
    
    render(<Breadcrumbs config={manyRoutesConfig} options={{ maxItems: 3 }} />);
    
    const dropdownTrigger = screen.getByRole('button', { name: /more/ });
    await userEvent.click(dropdownTrigger);
    
    // Check dropdown menu appears
    const dropdownMenu = screen.getByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();
    
    // Check dropdown items
    const dropdownItems = screen.getAllByRole('menuitem');
    expect(dropdownItems.length).toBeGreaterThan(0);
  });

  test('responsive design works', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    render(<Breadcrumbs config={mockConfig} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Should have responsive classes
    expect(nav).toHaveClass('breadcrumbs');
  });

  test('handles maxItems correctly', () => {
    const routesConfig = {
      routes: {
        '': { id: 'home', label: 'Home', href: '/' },
        'dashboard': { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        'analytics': { id: 'analytics', label: 'Analytics', href: '/analytics' },
        'transactions': { id: 'transactions', label: 'Transactions', href: '/transactions' }
      }
    };
    
    // Test with maxItems lower than total items
    render(<Breadcrumbs config={routesConfig} options={{ maxItems: 2 }} />);
    
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText(/more/)).toBeInTheDocument();
  });
});

describe('BreadcrumbProvider', () => {
  test('provides breadcrumb context', () => {
    const mockChild = jest.fn();
    
    render(
      <BreadcrumbProvider>
        <BreadcrumbProvider.Consumer>
          {context => {
            expect(context).toBeDefined();
            expect(context.addItem).toBeDefined();
            expect(context.removeItem).toBeDefined();
            expect(context.updateItem).toBeDefined();
            expect(context.clearItems).toBeDefined();
            expect(context.setItems).toBeDefined();
            mockChild();
            return null;
          }}
        </BreadcrumbProvider.Consumer>
      </BreadcrumbProvider>
    );
    
    expect(mockChild).toHaveBeenCalled();
  });

  test('uses initial items', () => {
    const initialItems = [
      { id: 'test', label: 'Test', href: '/test' }
    ];
    
    const mockChild = jest.fn();
    
    render(
      <BreadcrumbProvider initialItems={initialItems}>
        <BreadcrumbProvider.Consumer>
          {context => {
            expect(context.items).toEqual(initialItems);
            mockChild();
            return null;
          }}
        </BreadcrumbProvider.Consumer>
      </BreadcrumbProvider>
    );
    
    expect(mockChild).toHaveBeenCalled();
  });
});

describe('useBreadcrumbs hook', () => {
  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const TestComponent = () => {
      useBreadcrumbs();
      return null;
    };
    
    render(<TestComponent />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'useBreadcrumbs must be used within a BreadcrumbProvider'
    );
    
    consoleSpy.mockRestore();
  });
});
