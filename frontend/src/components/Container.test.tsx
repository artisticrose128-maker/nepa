import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Container } from './Container';

describe('Container', () => {
  test('renders children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('has w-full class', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('w-full');
  });

  test('centered by default (mx-auto)', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('mx-auto');
  });

  test('not centered when centered=false', () => {
    const { container } = render(<Container centered={false}>Content</Container>);
    expect(container.firstChild).not.toHaveClass('mx-auto');
  });

  test('applies xl max-width by default', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('max-w-screen-xl');
  });

  test('applies sm size', () => {
    const { container } = render(<Container size="sm">Content</Container>);
    expect(container.firstChild).toHaveClass('max-w-screen-sm');
  });

  test('applies 2xl size', () => {
    const { container } = render(<Container size="2xl">Content</Container>);
    expect(container.firstChild).toHaveClass('max-w-screen-2xl');
  });

  test('applies full size', () => {
    const { container } = render(<Container size="full">Content</Container>);
    expect(container.firstChild).toHaveClass('max-w-full');
  });

  test('applies md padding by default', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('px-4');
  });

  test('applies no padding when padding=none', () => {
    const { container } = render(<Container padding="none">Content</Container>);
    expect(container.firstChild).not.toHaveClass('px-4');
  });

  test('applies lg padding', () => {
    const { container } = render(<Container padding="lg">Content</Container>);
    expect(container.firstChild).toHaveClass('px-6');
  });

  test('renders as custom element', () => {
    render(<Container as="main">Content</Container>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<Container className="my-container">Content</Container>);
    expect(container.firstChild).toHaveClass('my-container');
  });
});
