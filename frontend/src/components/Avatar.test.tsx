import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarGroup } from './Avatar';

describe('Avatar', () => {
  test('renders image when src provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByAltText('Jane Doe')).toBeInTheDocument();
  });

  test('shows initials fallback when no src', () => {
    render(<Avatar alt="Jane Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('shows initials fallback when image errors', () => {
    render(<Avatar src="bad-url.jpg" alt="Jane Doe" />);
    fireEvent.error(screen.getByAltText('Jane Doe'));
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('uses explicit initials prop over alt', () => {
    render(<Avatar alt="Jane Doe" initials="JX" />);
    expect(screen.getByText('JX')).toBeInTheDocument();
  });

  test('truncates initials to 2 chars', () => {
    render(<Avatar initials="ABCD" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  test('shows ? when no alt or initials', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('applies md size class by default', () => {
    render(<Avatar alt="User" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('w-10', 'h-10');
  });

  test('applies sm size class', () => {
    render(<Avatar alt="User" size="sm" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('w-8', 'h-8');
  });

  test('applies lg size class', () => {
    render(<Avatar alt="User" size="lg" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('w-14', 'h-14');
  });

  test('applies circle shape by default', () => {
    render(<Avatar alt="User" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('rounded-full');
  });

  test('applies square shape', () => {
    render(<Avatar alt="User" shape="square" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('rounded-md');
  });

  test('renders status indicator', () => {
    render(<Avatar alt="User" status="online" />);
    expect(screen.getByRole('status', { name: 'Online' })).toBeInTheDocument();
  });

  test('status indicator has correct color for online', () => {
    render(<Avatar alt="User" status="online" />);
    expect(screen.getByRole('status')).toHaveClass('bg-success');
  });

  test('status indicator has correct color for busy', () => {
    render(<Avatar alt="User" status="busy" />);
    expect(screen.getByRole('status')).toHaveClass('bg-destructive');
  });

  test('applies custom className', () => {
    render(<Avatar alt="User" className="my-avatar" />);
    expect(screen.getByRole('img', { name: 'User' })).toHaveClass('my-avatar');
  });
});

describe('AvatarGroup', () => {
  test('renders all avatars when no max', () => {
    render(
      <AvatarGroup>
        <Avatar alt="A" />
        <Avatar alt="B" />
        <Avatar alt="C" />
      </AvatarGroup>
    );
    expect(screen.getAllByRole('img').length).toBe(3);
  });

  test('limits visible avatars to max', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar alt="A" />
        <Avatar alt="B" />
        <Avatar alt="C" />
      </AvatarGroup>
    );
    expect(screen.getAllByRole('img').length).toBe(2);
  });

  test('shows overflow count', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar alt="A" />
        <Avatar alt="B" />
        <Avatar alt="C" />
      </AvatarGroup>
    );
    expect(screen.getByLabelText('1 more')).toBeInTheDocument();
  });

  test('has group role', () => {
    render(
      <AvatarGroup>
        <Avatar alt="A" />
      </AvatarGroup>
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});
