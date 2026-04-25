import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Divider } from './Divider';

describe('Divider', () => {
  test('renders a separator', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  test('horizontal orientation by default', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  test('vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('applies dashed variant', () => {
    render(<Divider variant="dashed" />);
    expect(screen.getByRole('separator')).toHaveClass('border-dashed');
  });

  test('applies dotted variant', () => {
    render(<Divider variant="dotted" />);
    expect(screen.getByRole('separator')).toHaveClass('border-dotted');
  });

  test('applies thick weight', () => {
    render(<Divider weight="thick" />);
    expect(screen.getByRole('separator')).toHaveClass('border-2');
  });

  test('applies thin weight', () => {
    render(<Divider weight="thin" />);
    expect(screen.getByRole('separator')).toHaveClass('border-[0.5px]');
  });

  test('renders label text', () => {
    render(<Divider label="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  test('label divider has separator role', () => {
    render(<Divider label="Section" />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Divider className="my-divider" />);
    expect(screen.getByRole('separator')).toHaveClass('my-divider');
  });

  test('vertical divider has correct class', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveClass('border-l');
  });
});
