import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from './Loading';

describe('Loading Component', () => {
  test('renders with default medium size', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status') || document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8 h-8');
  });

  test('renders with small size', () => {
    render(<Loading size="sm" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4 h-4');
  });

  test('renders with large size', () => {
    render(<Loading size="lg" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12 h-12');
  });

  test('displays label when provided', () => {
    const testLabel = 'Loading data...';
    render(<Loading label={testLabel} />);
    
    expect(screen.getByText(testLabel)).toBeInTheDocument();
    expect(screen.getByText(testLabel)).toHaveClass('text-sm', 'text-gray-500', 'font-medium');
  });

  test('does not display label when not provided', () => {
    render(<Loading />);
    
    const labelElement = screen.queryByText(/loading/i);
    expect(labelElement).not.toBeInTheDocument();
  });

  test('has correct spinner styling', () => {
    render(<Loading />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass(
      'border-4',
      'border-blue-200',
      'border-t-blue-600',
      'rounded-full',
      'animate-spin'
    );
  });

  test('container has correct flex layout', () => {
    render(<Loading />);
    
    const container = document.querySelector('.flex');
    expect(container).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'space-y-2'
    );
  });

  test('renders without accessibility issues', () => {
    const { container } = render(<Loading label="Loading content" />);
    
    expect(container).toBeAccessible();
  });
});
