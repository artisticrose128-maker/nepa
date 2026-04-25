import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Tooltip from './Tooltip';
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

describe('Tooltip Component', () => {
  const defaultContent = 'Tooltip content';
  const defaultChild = <button>Hover me</button>;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders children without tooltip initially', () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText(defaultContent)).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} delay={0}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Show tooltip
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Trigger Types', () => {
    it('shows tooltip on focus with focus trigger', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="focus">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.focus(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('shows tooltip on click with click trigger', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Click again to hide
      fireEvent.click(trigger);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('does not show tooltip automatically with manual trigger', () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="manual">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.mouseEnter(trigger);
      fireEvent.focus(trigger);
      
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    const positions = ['top', 'bottom', 'left', 'right', 'center'] as const;

    positions.forEach((position) => {
      it(`positions tooltip at ${position}`, async () => {
        renderWithTheme(
          <Tooltip content={defaultContent} position={position}>
            {defaultChild}
          </Tooltip>
        );

        const trigger = screen.getByRole('button');
        fireEvent.mouseEnter(trigger);

        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Initially no aria-describedby
      expect(trigger).not.toHaveAttribute('aria-describedby');

      // On hover, should have aria-describedby
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Enter key should open tooltip
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Escape key should close tooltip
      fireEvent.keyDown(trigger, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('passes accessibility tests', async () => {
      const { container } = renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Customization', () => {
    it('applies custom className', () => {
      renderWithTheme(
        <Tooltip content={defaultContent} className="custom-tooltip">
          {defaultChild}
        </Tooltip>
      );

      const wrapper = screen.getByRole('button').parentElement;
      expect(wrapper).toHaveClass('custom-tooltip');
    });

    it('applies custom content className', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} contentClassName="custom-content">
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('custom-content');
      });
    });

    it('respects disabled state', () => {
      renderWithTheme(
        <Tooltip content={defaultContent} disabled>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      fireEvent.mouseEnter(trigger);
      fireEvent.focus(trigger);
      fireEvent.click(trigger);
      
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('applies maxWidth constraint', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} maxWidth={200}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveStyle('max-width: 200px');
      });
    });
  });

  describe('Controlled Component', () => {
    it('respects controlled open state', () => {
      const { rerender } = renderWithTheme(
        <Tooltip content={defaultContent} open={false}>
          {defaultChild}
        </Tooltip>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <Tooltip content={defaultContent} open={true}>
            {defaultChild}
          </Tooltip>
        </ThemeProvider>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('calls onOpenChange when controlled', async () => {
      const onOpenChange = jest.fn();
      
      renderWithTheme(
        <Tooltip content={defaultContent} trigger="click" onOpenChange={onOpenChange}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Arrow Display', () => {
    it('shows arrow by default', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('[style*="border"]');
        expect(arrow).toBeInTheDocument();
      });
    });

    it('hides arrow when arrow prop is false', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} arrow={false}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('[style*="border"]');
        expect(arrow).not.toBeInTheDocument();
      });
    });
  });

  describe('Delay Behavior', () => {
    it('respects delay before hiding', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent} delay={500}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      
      // Show tooltip
      fireEvent.mouseEnter(trigger);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Hide tooltip
      fireEvent.mouseLeave(trigger);
      
      // Should still be visible after 400ms
      act(() => {
        jest.advanceTimersByTime(400);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Should be hidden after 500ms
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('adapts to dark theme', async () => {
      renderWithTheme(
        <Tooltip content={defaultContent}>
          {defaultChild}
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('bg-gray-900', 'text-white', 'border-gray-700');
      });
    });
  });
});
