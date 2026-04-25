import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DataTable from './DataTable';

describe('DataTable Component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, active: true },
  ];

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', filterable: true },
    { key: 'age', label: 'Age', sortable: true, type: 'number' as const },
    { key: 'active', label: 'Active', type: 'boolean' as const },
  ];

  const mockActions = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: jest.fn(),
      icon: <span>Edit</span>,
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: jest.fn(),
      icon: <span>Delete</span>,
      variant: 'danger' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with data correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} />);
    
    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('handles sorting correctly', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    // Click on Name column to sort
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    
    // Should show ascending sort icon
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    
    // Click again to sort descending
    await user.click(nameHeader);
  });

  it('handles filtering correctly', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    // Open filters
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    // Filter by email
    const emailFilter = screen.getByPlaceholderText('Filter by Email');
    await user.type(emailFilter, 'john');
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + i,
      active: i % 2 === 0,
    }));

    render(<DataTable data={largeData} columns={mockColumns} pageSize={10} />);
    
    expect(screen.getByText('25 items')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument();
    
    // Navigate to next page
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextPageButton);
    
    expect(screen.getByText('Showing 11 to 20 of 25 results')).toBeInTheDocument();
  });

  it('handles row click correctly', async () => {
    const user = userEvent.setup();
    const mockOnRowClick = jest.fn();
    render(<DataTable data={mockData} columns={mockColumns} onRowClick={mockOnRowClick} />);
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    await user.click(firstRow!);
    
    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('renders boolean columns correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('handles actions menu correctly', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} columns={mockColumns} actions={mockActions} />);
    
    // Open actions menu
    const actionsButton = screen.getByRole('button', { name: /actions/i });
    await user.click(actionsButton);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Click on edit action
    await user.click(screen.getByText('Edit'));
    expect(mockActions[0].onClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles disabled actions correctly', async () => {
    const user = userEvent.setup();
    const actionsWithDisabled = [
      {
        key: 'edit',
        label: 'Edit',
        onClick: jest.fn(),
        disabled: () => true,
      },
    ];
    
    render(<DataTable data={mockData} columns={mockColumns} actions={actionsWithDisabled} />);
    
    const actionsButton = screen.getByRole('button', { name: /actions/i });
    await user.click(actionsButton);
    
    const editButton = screen.getByText('Edit');
    expect(editButton).toBeDisabled();
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    const mockOnExport = jest.fn();
    render(<DataTable data={mockData} columns={mockColumns} onExport={mockOnExport} />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);
    
    expect(mockOnExport).toHaveBeenCalledWith('csv');
  });

  it('handles custom cell rendering', () => {
    const columnsWithRender = [
      ...mockColumns,
      {
        key: 'name',
        label: 'Name',
        render: (value: any) => <strong>{value}</strong>,
      },
    ];
    
    render(<DataTable data={mockData} columns={columnsWithRender} />);
    
    expect(screen.getByText('John Doe').closest('strong')).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    render(<DataTable data={mockData} columns={mockColumns} loading={true} />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles custom empty message', () => {
    render(<DataTable data={[]} columns={mockColumns} emptyMessage="Custom empty message" />);
    
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('disables search when searchable prop is false', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={false} />);
    
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('disables pagination when pagination prop is false', () => {
    render(<DataTable data={mockData} columns={mockColumns} pagination={false} />);
    
    expect(screen.queryByText('Showing')).not.toBeInTheDocument();
  });

  it('handles custom page size', () => {
    render(<DataTable data={mockData} columns={mockColumns} pageSize={2} />);
    
    expect(screen.getByText('Showing 1 to 2 of 3 results')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(<DataTable data={mockData} columns={mockColumns} className="custom-table" />);
    
    expect(container.querySelector('.custom-table')).toBeInTheDocument();
  });

  it('handles date column type correctly', () => {
    const dataWithDate = [
      ...mockData,
      { id: 4, name: 'Test User', email: 'test@example.com', age: 40, active: true, createdAt: '2023-01-01' },
    ];
    
    const columnsWithDate = [
      ...mockColumns,
      { key: 'createdAt', label: 'Created At', type: 'date' as const },
    ];
    
    render(<DataTable data={dataWithDate} columns={columnsWithDate} />);
    
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
  });

  it('handles null/undefined values correctly', () => {
    const dataWithNull = [
      { id: 1, name: null, email: undefined, age: 30, active: true },
    ];
    
    render(<DataTable data={dataWithNull} columns={mockColumns} />);
    
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('closes actions menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} columns={mockColumns} actions={mockActions} />);
    
    const actionsButton = screen.getByRole('button', { name: /actions/i });
    await user.click(actionsButton);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });
});
