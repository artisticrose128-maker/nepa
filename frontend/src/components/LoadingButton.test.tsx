import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingButton } from './LoadingButton';

describe('LoadingButton Component', () => {
  test('renders children when not loading', () => {
    render(<LoadingButton>Click me</LoadingButton>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeVisible();
  });

  test('shows loading state when loading prop is true', () => {
    render(<LoadingButton loading>Click me</LoadingButton>);
    
    expect(screen.getByText('Click me')).toHaveClass('invisible');
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('displays loading text for screen readers when loading', () => {
    render(<LoadingButton loading loadingText="Submitting...">Submit</LoadingButton>);
    
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(screen.getByText('Submitting...')).toHaveClass('sr-only');
  });

  test('is disabled when disabled prop is true', () => {
    render(<LoadingButton disabled>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-60');
  });

  test('is disabled when loading', () => {
    render(<LoadingButton loading>Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none');
  });

  test('applies custom className', () => {
    render(<LoadingButton className="custom-class">Click me</LoadingButton>);
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('applies loading className when loading', () => {
    render(<LoadingButton loading loadingClassName="loading-custom">Click me</LoadingButton>);
    
    const loadingElement = document.querySelector('.loading-custom');
    expect(loadingElement).toBeInTheDocument();
  });

  test('handles click events when not loading', () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not handle click events when loading', () => {
    const handleClick = jest.fn();
    render(<LoadingButton loading onClick={handleClick}>Click me</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('passes through other button props', () => {
    render(<LoadingButton data-testid="test-button" type="submit">Submit</LoadingButton>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('has correct accessibility attributes', () => {
    render(<LoadingButton loading aria-label="Loading button">Click me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-label', 'Loading button');
  });
});
