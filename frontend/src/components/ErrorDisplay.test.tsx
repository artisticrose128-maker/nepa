import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorDisplay from './ErrorDisplay';
import { NetworkStatus } from '../services/networkStatusService';

// Mock the networkStatusService
jest.mock('../services/networkStatusService', () => ({
  NetworkStatus: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    SLOW: 'slow',
    UNSTABLE: 'unstable'
  }
}));

// Mock the errorHandler
jest.mock('../utils/errorHandler', () => ({
  ErrorHandler: {
    logError: jest.fn()
  }
}));

describe('ErrorDisplay Component', () => {
  const mockOnRetry = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.reload
    delete (window as any).location;
    (window as any).location = { reload: jest.fn() };
  });

  test('does not render when error is null', () => {
    render(
      <ErrorDisplay
        error={null}
        networkStatus={NetworkStatus.ONLINE}
      />
    );
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders error message correctly', () => {
    const errorMessage = 'Something went wrong';
    render(
      <ErrorDisplay
        error={errorMessage}
        networkStatus={NetworkStatus.ONLINE}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
  });

  test('displays correct title for offline status', () => {
    render(
      <ErrorDisplay
        error="No internet connection"
        networkStatus={NetworkStatus.OFFLINE}
      />
    );
    
    expect(screen.getByText('Connection Lost')).toBeInTheDocument();
  });

  test('displays correct title for slow connection', () => {
    render(
      <ErrorDisplay
        error="Connection is slow"
        networkStatus={NetworkStatus.SLOW}
      />
    );
    
    expect(screen.getByText('Slow Connection')).toBeInTheDocument();
  });

  test('displays correct title for unstable connection', () => {
    render(
      <ErrorDisplay
        error="Connection is unstable"
        networkStatus={NetworkStatus.UNSTABLE}
      />
    );
    
    expect(screen.getByText('Unstable Connection')).toBeInTheDocument();
  });

  test('shows appropriate help text for offline status', () => {
    render(
      <ErrorDisplay
        error="No internet"
        networkStatus={NetworkStatus.OFFLINE}
      />
    );
    
    expect(screen.getByText(/Please check your internet connection/)).toBeInTheDocument();
  });

  test('shows appropriate help text for slow connection', () => {
    render(
      <ErrorDisplay
        error="Slow connection"
        networkStatus={NetworkStatus.SLOW}
      />
    );
    
    expect(screen.getByText(/Your connection is slow/)).toBeInTheDocument();
  });

  test('shows appropriate help text for unstable connection', () => {
    render(
      <ErrorDisplay
        error="Unstable connection"
        networkStatus={NetworkStatus.UNSTABLE}
      />
    );
    
    expect(screen.getByText(/Your connection is unstable/)).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    render(
      <ErrorDisplay
        error="Retryable error"
        networkStatus={NetworkStatus.ONLINE}
        onRetry={mockOnRetry}
        retryCount={0}
      />
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  test('displays correct retry text based on retry count', () => {
    const { rerender } = render(
      <ErrorDisplay
        error="Retryable error"
        networkStatus={NetworkStatus.ONLINE}
        onRetry={mockOnRetry}
        retryCount={1}
      />
    );
    
    expect(screen.getByText('Retry (1/3)')).toBeInTheDocument();
    
    rerender(
      <ErrorDisplay
        error="Retryable error"
        networkStatus={NetworkStatus.ONLINE}
        onRetry={mockOnRetry}
        retryCount={2}
      />
    );
    
    expect(screen.getByText('Retry (2/3)')).toBeInTheDocument();
    
    rerender(
      <ErrorDisplay
        error="Retryable error"
        networkStatus={NetworkStatus.ONLINE}
        onRetry={mockOnRetry}
        retryCount={3}
      />
    );
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  test('does not show retry button after 3 attempts', () => {
    render(
      <ErrorDisplay
        error="Retryable error"
        networkStatus={NetworkStatus.ONLINE}
        onRetry={mockOnRetry}
        retryCount={3}
      />
    );
    
    expect(screen.queryByText(/Retry/)).not.toBeInTheDocument();
  });

  test('calls onDismiss when dismiss button is clicked', () => {
    render(
      <ErrorDisplay
        error="Dismissible error"
        networkStatus={NetworkStatus.ONLINE}
        onDismiss={mockOnDismiss}
      />
    );
    
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  test('shows refresh page button for offline status', () => {
    render(
      <ErrorDisplay
        error="No internet"
        networkStatus={NetworkStatus.OFFLINE}
      />
    );
    
    const refreshButton = screen.getByText('Refresh Page');
    expect(refreshButton).toBeInTheDocument();
  });

  test('reloads page when refresh button is clicked', () => {
    const mockReload = jest.fn();
    (window as any).location.reload = mockReload;
    
    render(
      <ErrorDisplay
        error="No internet"
        networkStatus={NetworkStatus.OFFLINE}
      />
    );
    
    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);
    
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    const customClass = 'custom-error-class';
    const { container } = render(
      <ErrorDisplay
        error="Test error"
        networkStatus={NetworkStatus.ONLINE}
        className={customClass}
      />
    );
    
    const errorContainer = container.querySelector('.rounded-lg');
    expect(errorContainer).toHaveClass(customClass);
  });

  test('applies correct color classes based on network status', () => {
    const { rerender } = render(
      <ErrorDisplay
        error="Test error"
        networkStatus={NetworkStatus.OFFLINE}
      />
    );
    
    let errorContainer = document.querySelector('.rounded-lg');
    expect(errorContainer).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    
    rerender(
      <ErrorDisplay
        error="Test error"
        networkStatus={NetworkStatus.SLOW}
      />
    );
    
    errorContainer = document.querySelector('.rounded-lg');
    expect(errorContainer).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
    
    rerender(
      <ErrorDisplay
        error="Test error"
        networkStatus={NetworkStatus.UNSTABLE}
      />
    );
    
    errorContainer = document.querySelector('.rounded-lg');
    expect(errorContainer).toHaveClass('bg-orange-50', 'border-orange-200', 'text-orange-800');
  });
});
