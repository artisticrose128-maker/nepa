import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  test('renders progressbar role', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('sets aria-valuenow', () => {
    render(<ProgressBar value={40} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  test('sets aria-valuemin and aria-valuemax', () => {
    render(<ProgressBar value={50} max={200} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '200');
  });

  test('clamps value to 0', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const fill = container.querySelector('.progress-bar') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  test('clamps value to 100%', () => {
    const { container } = render(<ProgressBar value={150} />);
    const fill = container.querySelector('.progress-bar') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  test('shows label when showLabel=true', () => {
    render(<ProgressBar value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('shows custom label text', () => {
    render(<ProgressBar value={50} showLabel label="Halfway" />);
    expect(screen.getByText('Halfway')).toBeInTheDocument();
  });

  test('applies success variant', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    expect(container.querySelector('.progress-bar')).toHaveClass('bg-success');
  });

  test('applies warning variant', () => {
    const { container } = render(<ProgressBar value={50} variant="warning" />);
    expect(container.querySelector('.progress-bar')).toHaveClass('bg-warning');
  });

  test('applies destructive variant', () => {
    const { container } = render(<ProgressBar value={50} variant="destructive" />);
    expect(container.querySelector('.progress-bar')).toHaveClass('bg-destructive');
  });

  test('applies sm size class', () => {
    render(<ProgressBar value={50} size="sm" />);
    expect(screen.getByRole('progressbar')).toHaveClass('h-1');
  });

  test('applies lg size class', () => {
    render(<ProgressBar value={50} size="lg" />);
    expect(screen.getByRole('progressbar')).toHaveClass('h-4');
  });

  test('indeterminate mode omits aria-valuenow', () => {
    render(<ProgressBar value={0} indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  test('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="my-progress" />);
    expect(container.firstChild).toHaveClass('my-progress');
  });
});
