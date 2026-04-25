import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid, GridItem } from './Grid';

describe('Grid', () => {
  test('renders children', () => {
    render(<Grid><div>Item</div></Grid>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  test('has grid class', () => {
    const { container } = render(<Grid>content</Grid>);
    expect(container.firstChild).toHaveClass('grid');
  });

  test('applies cols class', () => {
    const { container } = render(<Grid cols={3}>content</Grid>);
    expect(container.firstChild).toHaveClass('grid-cols-3');
  });

  test('applies responsive colsMd class', () => {
    const { container } = render(<Grid cols={1} colsMd={2}>content</Grid>);
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  test('applies responsive colsLg class', () => {
    const { container } = render(<Grid cols={1} colsLg={4}>content</Grid>);
    expect(container.firstChild).toHaveClass('lg:grid-cols-4');
  });

  test('applies gap class', () => {
    const { container } = render(<Grid gap={4}>content</Grid>);
    expect(container.firstChild).toHaveClass('gap-4');
  });

  test('applies gapX class', () => {
    const { container } = render(<Grid gapX={6}>content</Grid>);
    expect(container.firstChild).toHaveClass('gap-x-6');
  });

  test('applies gapY class', () => {
    const { container } = render(<Grid gapY={2}>content</Grid>);
    expect(container.firstChild).toHaveClass('gap-y-2');
  });

  test('renders as custom element', () => {
    render(<Grid as="section">content</Grid>);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<Grid className="my-grid">content</Grid>);
    expect(container.firstChild).toHaveClass('my-grid');
  });
});

describe('GridItem', () => {
  test('renders children', () => {
    render(<GridItem><span>Cell</span></GridItem>);
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  test('applies span class', () => {
    const { container } = render(<GridItem span={6}>Cell</GridItem>);
    expect(container.firstChild).toHaveClass('col-span-6');
  });

  test('applies full span class', () => {
    const { container } = render(<GridItem span="full">Cell</GridItem>);
    expect(container.firstChild).toHaveClass('col-span-full');
  });

  test('applies responsive spanMd class', () => {
    const { container } = render(<GridItem span={12} spanMd={6}>Cell</GridItem>);
    expect(container.firstChild).toHaveClass('md:col-span-6');
  });

  test('applies responsive spanLg class', () => {
    const { container } = render(<GridItem spanLg={4}>Cell</GridItem>);
    expect(container.firstChild).toHaveClass('lg:col-span-4');
  });

  test('renders as custom element', () => {
    render(<GridItem as="article">Cell</GridItem>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<GridItem className="my-item">Cell</GridItem>);
    expect(container.firstChild).toHaveClass('my-item');
  });
});
