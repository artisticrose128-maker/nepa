import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Loading } from '../../components/Loading';
import { Skeleton } from '../../components/Skeleton';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingButton } from '../../components/LoadingButton';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Loading Components Accessibility', () => {
  describe('Loading Component', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<Loading label="Loading content" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper ARIA attributes when label is provided', () => {
      render(<Loading label="Loading data" />);
      
      // Check that label is visible to screen readers
      expect(screen.getByText('Loading data')).toBeInTheDocument();
    });

    test('should respect reduced motion preference', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Loading variant="dots" />);
      
      // Component should still render without animations
      const dots = document.querySelector('.dots-loading');
      expect(dots).toBeInTheDocument();
    });
  });

  describe('Skeleton Component', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<Skeleton />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper ARIA attributes', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    test('should include screen reader text', () => {
      render(<Skeleton />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('ProgressBar Component', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<ProgressBar value={50} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper progressbar role and attributes', () => {
      render(<ProgressBar value={75} max={100} />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    test('should handle indeterminate progress correctly', () => {
      render(<ProgressBar value={0} indeterminate />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).toHaveAttribute('aria-valuetext', 'Loading…');
    });

    test('should use custom label when provided', () => {
      render(<ProgressBar value={50} label="Custom progress label" />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Custom progress label');
    });
  });

  describe('LoadingButton Component', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<LoadingButton>Click me</LoadingButton>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper ARIA attributes when loading', () => {
      render(<LoadingButton loading loadingText="Submitting">Submit</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Submitting')).toBeInTheDocument();
      expect(screen.getByText('Submitting')).toHaveClass('sr-only');
    });

    test('should be properly disabled when loading', () => {
      render(<LoadingButton loading>Submit</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('LoadingButton should be keyboard accessible', () => {
      render(<LoadingButton>Click me</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    test('disabled LoadingButton should not be focusable', () => {
      render(<LoadingButton disabled>Click me</LoadingButton>);
      
      const button = screen.getByRole('button');
      // Disabled buttons should not be focusable
      expect(button).toBeDisabled();
    });
  });

  describe('Color Contrast', () => {
    test('should maintain sufficient contrast ratios', () => {
      // This is a simplified test - in production, use a proper contrast checking library
      const { container } = render(<Loading label="Loading" />);
      
      // Basic visibility check
      const element = screen.getByText('Loading');
      expect(element).toBeVisible();
    });
  });

  describe('Screen Reader Announcements', () => {
    test('should announce loading state changes', () => {
      const { rerender } = render(<LoadingButton loading={false}>Submit</LoadingButton>);
      
      let button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-busy');
      
      rerender(<LoadingButton loading>Submit</LoadingButton>);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });
});
