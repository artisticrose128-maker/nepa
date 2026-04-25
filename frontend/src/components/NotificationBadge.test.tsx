import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import * as fc from 'fast-check';
import NotificationBadge from './NotificationBadge';

function getIndicator(container: HTMLElement): HTMLElement | null {
  const wrapper = container.querySelector('[role="status"]');
  if (!wrapper) return null;
  const spans = wrapper.querySelectorAll(':scope > span');
  return spans.length > 1 ? (spans[spans.length - 1] as HTMLElement) : null;
}

describe('NotificationBadge — count=0 hidden', () => {
  test('indicator not rendered when count=0 and showZero=false', () => {
    const { container } = render(
      <NotificationBadge count={0}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toBeNull();
  });

  test('indicator renders "0" when showZero=true and count=0', () => {
    const { container } = render(
      <NotificationBadge count={0} showZero><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveTextContent('0');
  });
});

describe('NotificationBadge — max cap', () => {
  test('displays "{max}+" when count exceeds max', () => {
    const { container } = render(
      <NotificationBadge count={150} max={99}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveTextContent('99+');
  });

  test('displays raw count when count <= max', () => {
    const { container } = render(
      <NotificationBadge count={5} max={99}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveTextContent('5');
  });
});

describe('NotificationBadge — dot mode', () => {
  test('renders circle with no numeric text when dot=true', () => {
    const { container } = render(
      <NotificationBadge dot><span>icon</span></NotificationBadge>
    );
    const indicator = getIndicator(container);
    expect(indicator).toBeInTheDocument();
    expect(indicator?.textContent).toBe('');
  });

  test('dot mode shows indicator even when count=0', () => {
    const { container } = render(
      <NotificationBadge count={0} dot><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toBeInTheDocument();
  });
});

describe('NotificationBadge — default variant', () => {
  test('default variant is destructive (applies bg-destructive)', () => {
    const { container } = render(
      <NotificationBadge count={3}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveClass('bg-destructive');
  });
});

describe('NotificationBadge — wrapper layout', () => {
  test('wrapper has inline-flex class', () => {
    const { container } = render(
      <NotificationBadge count={1}><span>icon</span></NotificationBadge>
    );
    expect(container.querySelector('[role="status"]')).toHaveClass('inline-flex');
  });

  test('wrapper has role="status"', () => {
    const { container } = render(
      <NotificationBadge count={1}><span>icon</span></NotificationBadge>
    );
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});

describe('NotificationBadge — aria-labels', () => {
  test('indicator has aria-label="{count} notifications" when count > 0', () => {
    const { container } = render(
      <NotificationBadge count={7}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveAttribute('aria-label', '7 notifications');
  });

  test('dot mode indicator has aria-label="New notifications"', () => {
    const { container } = render(
      <NotificationBadge dot><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveAttribute('aria-label', 'New notifications');
  });

  test('no indicator when hidden (count=0, showZero=false)', () => {
    const { container } = render(
      <NotificationBadge count={0}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toBeNull();
  });
});

describe('NotificationBadge — animation classes', () => {
  test('indicator has animate-badge-scale-in class', () => {
    const { container } = render(
      <NotificationBadge count={1}><span>icon</span></NotificationBadge>
    );
    expect(getIndicator(container)).toHaveClass('animate-badge-scale-in');
  });
});

describe('NotificationBadge — accessibility (jest-axe)', () => {
  test('no violations for count mode', async () => {
    const { container } = render(
      <NotificationBadge count={5}><span>Bell</span></NotificationBadge>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test('no violations for dot mode', async () => {
    const { container } = render(
      <NotificationBadge dot><span>Bell</span></NotificationBadge>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NotificationBadge — Property 4: max cap display', () => {
  test('displays {max}+ when count > max', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.integer({ min: 1, max: 500 }), (a, b) => {
        const [count, max] = a > b ? [a, b] : [b + 1, b];
        const { container } = render(
          <NotificationBadge count={count} max={max}><span>x</span></NotificationBadge>
        );
        return getIndicator(container)?.textContent === `${max}+`;
      }),
      { numRuns: 25 }
    );
  });

  test('displays raw count when count <= max', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.integer({ min: 1, max: 500 }), (a, b) => {
        const count = Math.min(a, b);
        const max = Math.max(a, b);
        const { container } = render(
          <NotificationBadge count={count} max={max}><span>x</span></NotificationBadge>
        );
        return getIndicator(container)?.textContent === String(count);
      }),
      { numRuns: 25 }
    );
  });
});

describe('NotificationBadge — Property 5: dot mode suppresses numeric content', () => {
  test('no numeric text in dot mode for any count', () => {
    fc.assert(
      fc.property(fc.nat(1000), (count) => {
        const { container } = render(
          <NotificationBadge count={count} dot><span>x</span></NotificationBadge>
        );
        const indicator = getIndicator(container);
        return indicator !== null && indicator.textContent === '';
      }),
      { numRuns: 25 }
    );
  });
});

describe('NotificationBadge — Property 6: count aria-label correctness', () => {
  test('aria-label equals "{count} notifications" for any count > 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9999 }), (count) => {
        const { container } = render(
          <NotificationBadge count={count}><span>x</span></NotificationBadge>
        );
        return getIndicator(container)?.getAttribute('aria-label') === `${count} notifications`;
      }),
      { numRuns: 25 }
    );
  });
});
