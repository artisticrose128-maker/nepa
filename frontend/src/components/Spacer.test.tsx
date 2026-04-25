import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Spacer } from './Spacer';

describe('Spacer', () => {
  test('renders with aria-hidden', () => {
    render(<Spacer />);
    expect(screen.getByTestId('spacer')).toHaveAttribute('aria-hidden', 'true');
  });

  test('default vertical axis sets height', () => {
    render(<Spacer size={4} axis="vertical" />);
    const el = screen.getByTestId('spacer');
    expect(el.style.height).toBe('1rem');
    expect(el.style.width).toBe('');
  });

  test('horizontal axis sets width', () => {
    render(<Spacer size={4} axis="horizontal" />);
    const el = screen.getByTestId('spacer');
    expect(el.style.width).toBe('1rem');
    expect(el.style.height).toBe('');
  });

  test('both axis sets width and height', () => {
    render(<Spacer size={8} axis="both" />);
    const el = screen.getByTestId('spacer');
    expect(el.style.width).toBe('2rem');
    expect(el.style.height).toBe('2rem');
  });

  test('flex mode sets flex style', () => {
    render(<Spacer flex />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ flex: '1 1 auto' });
  });

  test('size 1 maps to 0.25rem', () => {
    render(<Spacer size={1} />);
    expect(screen.getByTestId('spacer').style.height).toBe('0.25rem');
  });

  test('size 16 maps to 4rem', () => {
    render(<Spacer size={16} />);
    expect(screen.getByTestId('spacer').style.height).toBe('4rem');
  });

  test('size 32 maps to 8rem', () => {
    render(<Spacer size={32} />);
    expect(screen.getByTestId('spacer').style.height).toBe('8rem');
  });

  test('applies custom className', () => {
    render(<Spacer className="my-spacer" />);
    expect(screen.getByTestId('spacer')).toHaveClass('my-spacer');
  });
});
