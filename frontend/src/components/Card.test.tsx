import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card', () => {
  test('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('applies default card class', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('card');
  });

  test('applies outline variant', () => {
    const { container } = render(<Card variant="outline">Content</Card>);
    expect(container.firstChild).toHaveClass('border-2');
  });

  test('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  test('applies ghost variant', () => {
    const { container } = render(<Card variant="ghost">Content</Card>);
    expect(container.firstChild).toHaveClass('bg-transparent');
  });

  test('renders as button role when onClick provided', () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Click me</Card>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('triggers onClick on Enter key', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>Card</Card>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('applies selected ring when selected=true', () => {
    render(<Card onClick={() => {}} selected>Card</Card>);
    expect(screen.getByRole('button')).toHaveClass('ring-2');
  });

  test('applies custom className', () => {
    const { container } = render(<Card className="my-card">Content</Card>);
    expect(container.firstChild).toHaveClass('my-card');
  });

  test('renders as custom element via as prop', () => {
    render(<Card as="article">Content</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});

describe('Card sub-components', () => {
  test('CardHeader renders with card-header class', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstChild).toHaveClass('card-header');
  });

  test('CardTitle renders as h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
  });

  test('CardDescription renders with card-description class', () => {
    const { container } = render(<CardDescription>Desc</CardDescription>);
    expect(container.firstChild).toHaveClass('card-description');
  });

  test('CardContent renders with card-content class', () => {
    const { container } = render(<CardContent>Body</CardContent>);
    expect(container.firstChild).toHaveClass('card-content');
  });

  test('CardFooter renders with card-footer class', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstChild).toHaveClass('card-footer');
  });
});
