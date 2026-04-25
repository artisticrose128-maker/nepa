import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import StatusBadge, { StatusValue } from './StatusBadge';

const statusClasses: Record<StatusValue, { dot: string; text: string }> = {
  active:   { dot: 'bg-success',          text: 'text-success' },
  inactive: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  pending:  { dot: 'bg-warning',          text: 'text-warning' },
  error:    { dot: 'bg-destructive',      text: 'text-destructive' },
  warning:  { dot: 'bg-warning',          text: 'text-warning' },
};

const allStatuses = Object.keys(statusClasses) as StatusValue[];

describe('StatusBadge — status color classes', () => {
  allStatuses.forEach((status) => {
    test(`applies correct dot and text classes for status="${status}"`, () => {
      const { container } = render(<StatusBadge status={status} label={status} />);
      const dot = container.querySelector('[aria-hidden="true"]');
      const wrapper = container.querySelector('[aria-label]') as HTMLElement;
      const labelSpan = wrapper?.lastElementChild as HTMLElement;
      expect(dot).toHaveClass(statusClasses[status].dot);
      expect(labelSpan).toHaveClass(statusClasses[status].text);
    });
  });
});

describe('StatusBadge — label rendering', () => {
  test('renders label text alongside dot when label is provided', () => {
    const { container } = render(<StatusBadge status="active" label="Active" />);
    expect(container).toHaveTextContent('Active');
  });

  test('renders only dot when label is omitted', () => {
    const { container } = render(<StatusBadge status="active" />);
    const wrapper = container.querySelector('span[aria-label]');
    const children = wrapper ? Array.from(wrapper.children) : [];
    expect(children).toHaveLength(1);
    expect(children[0]).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('StatusBadge — accessibility', () => {
  test('dot has aria-hidden="true"', () => {
    const { container } = render(<StatusBadge status="pending" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  test('container has aria-label="Status: {status}" for all statuses', () => {
    allStatuses.forEach((status) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.querySelector(`[aria-label="Status: ${status}"]`)).toBeInTheDocument();
    });
  });
});

describe('StatusBadge — Property 7: color class coverage', () => {
  test('correct dot and text classes for all status values', () => {
    fc.assert(
      fc.property(fc.constantFrom(...allStatuses), (status) => {
        const { container } = render(<StatusBadge status={status} label={status} />);
        const dot = container.querySelector('[aria-hidden="true"]');
        const wrapper = container.querySelector('[aria-label]') as HTMLElement;
        const labelSpan = wrapper?.lastElementChild as HTMLElement;
        return (
          dot?.className.includes(statusClasses[status].dot) === true &&
          labelSpan?.className.includes(statusClasses[status].text) === true
        );
      }),
      { numRuns: 25 }
    );
  });
});
