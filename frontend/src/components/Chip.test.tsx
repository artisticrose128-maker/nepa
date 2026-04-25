import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Chip } from './Chip';

describe('Chip', () => {
  test('renders label', () => {
    render(<Chip label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  test('renders as span when not clickable', () => {
    render(<Chip label="Tag" />);
    expect(screen.getByText('Tag').closest('span')).toBeInTheDocument();
  });

  test('renders as button when onClick provided', () => {
    render(<Chip label="Tag" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Tag' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Chip label="Tag" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tag' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('shows remove button when onRemove provided', () => {
    render(<Chip label="Tag" onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove Tag' })).toBeInTheDocument();
  });

  test('calls onRemove when remove button clicked', () => {
    const onRemove = jest.fn();
    render(<Chip label="Tag" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tag' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test('applies primary variant class', () => {
    render(<Chip label="Tag" variant="primary" />);
    expect(screen.getByLabelText('Tag')).toHaveClass('bg-primary');
  });

  test('applies success variant class', () => {
    render(<Chip label="Tag" variant="success" />);
    expect(screen.getByLabelText('Tag')).toHaveClass('text-success');
  });

  test('applies sm size class', () => {
    render(<Chip label="Tag" size="sm" />);
    expect(screen.getByLabelText('Tag')).toHaveClass('text-xs');
  });

  test('applies lg size class', () => {
    render(<Chip label="Tag" size="lg" />);
    expect(screen.getByLabelText('Tag')).toHaveClass('text-base');
  });

  test('applies selected ring when selected=true', () => {
    render(<Chip label="Tag" onClick={() => {}} selected={true} />);
    expect(screen.getByRole('button', { name: 'Tag' })).toHaveClass('ring-2');
  });

  test('is disabled when disabled=true', () => {
    render(<Chip label="Tag" onClick={() => {}} disabled={true} />);
    expect(screen.getByRole('button', { name: 'Tag' })).toBeDisabled();
  });

  test('renders icon', () => {
    render(<Chip label="Tag" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Chip label="Tag" className="my-chip" />);
    expect(screen.getByLabelText('Tag')).toHaveClass('my-chip');
  });
});
