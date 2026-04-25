import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  const mockOnToggle = jest.fn();
  const mockOnItemClick = jest.fn();
  const mockOnCollapsedChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders sidebar with default items', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('NEPA')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bill Payment')).toBeInTheDocument();
    expect(screen.getByText('Yield Generation')).toBeInTheDocument();
  });

  it('highlights active item correctly', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="payments"
        onItemClick={mockOnItemClick}
      />
    );

    const paymentsItem = screen.getByText('Bill Payment').closest('button');
    expect(paymentsItem).toHaveClass('bg-blue-50', 'text-blue-600', 'border-l-4', 'border-blue-600');
  });

  it('handles item clicks correctly', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockOnItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'dashboard',
        label: 'Dashboard'
      })
    );
  });

  it('expands and collapses nested items', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    // Initially, nested items should not be visible
    expect(screen.queryByText('New Payment')).not.toBeInTheDocument();

    // Click on Bill Payment to expand
    fireEvent.click(screen.getByText('Bill Payment'));

    // Now nested items should be visible
    expect(screen.getByText('New Payment')).toBeInTheDocument();
    expect(screen.getByText('Payment History')).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(screen.getByText('Bill Payment'));
    expect(screen.queryByText('New Payment')).not.toBeInTheDocument();
  });

  it('shows badges correctly', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('handles collapsed state correctly', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
        collapsed={true}
        onCollapsedChange={mockOnCollapsedChange}
      />
    );

    // In collapsed state, only icons should be visible
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it('handles collapse toggle click', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
        collapsed={false}
        onCollapsedChange={mockOnCollapsedChange}
      />
    );

    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(collapseButton);
    expect(mockOnCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    const paymentsButton = screen.getByText('Bill Payment').closest('button');
    expect(paymentsButton).toHaveAttribute('aria-haspopup', 'true');
    expect(paymentsButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('handles mobile behavior correctly', async () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    // Should show close button on mobile
    expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();

    // Clicking an item should close sidebar on mobile
    fireEvent.click(screen.getByText('Dashboard'));
    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalled();
    });
  });

  it('renders logout button correctly', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <Sidebar
        isOpen={true}
        onToggle={mockOnToggle}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    );

    const dashboardButton = screen.getByText('Dashboard');
    dashboardButton.focus();
    expect(dashboardButton).toHaveFocus();

    // Test Tab navigation
    fireEvent.keyDown(dashboardButton, { key: 'Tab' });
  });
});
