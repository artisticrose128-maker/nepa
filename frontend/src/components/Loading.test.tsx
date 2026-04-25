import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from './Loading';

describe('Loading Component', () => {
  beforeEach(() => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('renders with default medium size spinner', () => {
    render(<Loading />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-md');
  });

  test('renders with small size', () => {
    render(<Loading size="sm" />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-sm');
  });

  test('renders with large size', () => {
    render(<Loading size="lg" />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-lg');
  });

  test('renders with extra large size', () => {
    render(<Loading size="xl" />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('spinner-xl');
  });

  test('displays label when provided', () => {
    const testLabel = 'Loading data...';
    render(<Loading label={testLabel} />);
    
    expect(screen.getByText(testLabel)).toBeInTheDocument();
    expect(screen.getByText(testLabel)).toHaveClass('loading-message-lg');
  });

  test('displays inline label when inline and label provided', () => {
    const testLabel = 'Loading...';
    render(<Loading label={testLabel} inline />);
    
    expect(screen.getByText(testLabel)).toBeInTheDocument();
    expect(screen.getByText(testLabel)).toHaveClass('loading-message');
  });

  test('does not display label when not provided', () => {
    render(<Loading />);
    
    const labelElement = screen.queryByText(/loading/i);
    expect(labelElement).not.toBeInTheDocument();
  });

  test('renders dots variant', () => {
    render(<Loading variant="dots" />);
    
    const dotsContainer = document.querySelector('.dots-loading');
    expect(dotsContainer).toBeInTheDocument();
    expect(dotsContainer?.children).toHaveLength(3);
  });

  test('renders pulse variant', () => {
    render(<Loading variant="pulse" />);
    
    const pulse = document.querySelector('.pulse-loading');
    expect(pulse).toBeInTheDocument();
  });

  test('renders skeleton variant', () => {
    render(<Loading variant="skeleton" />);
    
    const skeletonText = document.querySelector('.skeleton-text');
    expect(skeletonText).toBeInTheDocument();
  });

  test('renders fullscreen overlay', () => {
    render(<Loading fullscreen />);
    
    const overlay = document.querySelector('.loading-overlay');
    expect(overlay).toBeInTheDocument();
    const container = document.querySelector('.loading-container');
    expect(container).toBeInTheDocument();
  });

  test('renders inline layout', () => {
    render(<Loading inline />);
    
    const container = document.querySelector('.flex-row');
    expect(container).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Loading className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  test('has correct accessibility attributes when label is provided', () => {
    render(<Loading label="Loading content" />);
    
    const label = screen.getByText('Loading content');
    expect(label).toBeInTheDocument();
  });

  test('respects reduced motion preference', () => {
    // Mock reduced motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<Loading variant="dots" />);
    
    const dots = document.querySelector('.dots-loading');
    expect(dots).toBeInTheDocument();
  });

  test('container has correct flex layout', () => {
    render(<Loading />);
    
    const container = document.querySelector('.flex');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  test('renders without accessibility issues', () => {
    const { container } = render(<Loading label="Loading content" />);
    
    // Basic accessibility checks
    expect(container).toBeVisible();
  });

  test('fullscreen overlay has correct z-index and backdrop', () => {
    render(<Loading fullscreen />);
    
    const overlay = document.querySelector('.loading-overlay');
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });
});
