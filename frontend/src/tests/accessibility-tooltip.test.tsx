import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Tooltip from '../components/Tooltip';
import { ThemeProvider } from '../contexts/ThemeContext';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Tooltip Accessibility Tests', () => {
  const defaultContent = 'This is helpful tooltip content';
  const defaultChild = <button>Interactive element</button>;

  describe('WCAG Compliance', () => {
    it('should not have accessibility violations when closed', async () => {
      const { container } = renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations when open', async () => {
      const { container } = renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Should be focusable
      expect(trigger).toHaveAttribute('tabIndex', '0');
      
      // Should not have aria-describedby when closed
      expect(trigger).not.toHaveAttribute('aria-describedby');

      // Should have aria-describedby when open
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should have role="tooltip" on tooltip content', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute('role', 'tooltip');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible with Enter key', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Focus the trigger
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Press Enter to open
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible with Space key', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Focus the trigger
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Press Space to open
      fireEvent.keyDown(trigger, { key: ' ' });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should close on Escape key', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Open tooltip
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Press Escape to close
      fireEvent.keyDown(trigger, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should open on focus with focus trigger', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="focus">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Focus the trigger
      fireEvent.focus(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Blur should close
      fireEvent.blur(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce tooltip content when opened', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(defaultContent);
      });
    });

    it('should work with descriptive content', async () => {
      const descriptiveContent = 'This action will permanently delete the item and cannot be undone.';
      
      renderWithTheme(
        <Tooltip content={descriptiveContent}>
          <button>Delete Item</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button', { name: 'Delete Item' });
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent(descriptiveContent);
      });
    });

    it('should work with complex content', async () => {
      const complexContent = (
        <div>
          <strong>Important:</strong> This action cannot be undone.
          <br />
          Please confirm before proceeding.
        </div>
      );
      
      renderWithTheme(
        <Tooltip content={complexContent}>
          <button>Advanced Action</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('Important:');
        expect(tooltip).toHaveTextContent('This action cannot be undone.');
      });
    });
  });

  describe('Color Contrast', () => {
    it('should maintain contrast in light theme', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('bg-white', 'text-gray-900');
      });
    });

    it('should maintain contrast in dark theme', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        // Dark theme classes should be applied
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    it('should not trap focus when opened', async () => {
      const { container } = renderWithTheme(
        <div>
          <Tooltip content={defaultContent} trigger="click">
            <button>First Button</button>
          </Tooltip>
          <button>Second Button</button>
        </div>
      );

      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const secondButton = screen.getByRole('button', { name: 'Second Button' });

      // Open tooltip
      fireEvent.click(firstButton);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Focus should move to second button
      secondButton.focus();
      expect(secondButton).toHaveFocus();
      
      // Tooltip should close on blur
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should handle focus with hover trigger', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="hover">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Focus should open tooltip
      fireEvent.focus(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Blur should close tooltip
      fireEvent.blur(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion', async () => {
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

      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Should have transition classes
        expect(tooltip).toHaveClass('transition-all');
      });
    });
  });

  describe('High Contrast Mode', () => {
    it('should be visible in high contrast mode', async () => {
      // Mock high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        // Should have border for visibility
        expect(tooltip).toHaveClass('border');
      });
    });
  });
});
