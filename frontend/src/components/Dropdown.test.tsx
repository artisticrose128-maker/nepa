import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dropdown, { DropdownItem } from './Dropdown';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">▼</div>,
  ChevronUp: () => <div data-testid="chevron-up">▲</div>,
  Check: () => <div data-testid="check">✓</div>,
}));

const mockItems: DropdownItem[] = [
  { id: '1', label: 'Option 1', value: 'option1' },
  { id: '2', label: 'Option 2', value: 'option2' },
  { id: '3', label: 'Option 3', value: 'option3', disabled: true },
  { id: '4', label: 'Option 4', value: 'option4', description: 'Description for option 4' },
  { id: '5', label: 'Option 5', value: 'option5', badge: 'New' },
];

describe('Dropdown', () => {
  const mockOnSelect = jest.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnSelect.mockClear();
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dropdown trigger with placeholder', () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Select an option');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('renders selected option when value is provided', () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} value="option2" />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveTextContent('Option 2');
    });

    it('renders with custom placeholder', () => {
      render(
        <Dropdown 
          items={mockItems} 
          onSelect={mockOnSelect} 
          placeholder="Choose something"
        />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveTextContent('Choose something');
    });

    it('applies custom className', () => {
      render(
        <Dropdown 
          items={mockItems} 
          onSelect={mockOnSelect} 
          className="custom-dropdown"
        />
      );
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('custom-dropdown');
    });

    it('renders disabled state', () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} disabled />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Dropdown Menu', () => {
    it('opens menu when trigger is clicked', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes menu when clicking outside', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('closes menu when pressing Escape key', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('renders all menu items', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(mockItems.length);
      
      mockItems.forEach((item, index) => {
        expect(options[index]).toHaveTextContent(item.label);
      });
    });

    it('shows disabled state for disabled items', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      const disabledOption = screen.getByText('Option 3').closest('[role="option"]');
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
      expect(disabledOption).toHaveClass('opacity-50');
    });

    it('shows descriptions when provided', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('Description for option 4')).toBeInTheDocument();
    });

    it('shows badges when provided', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when option is clicked', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      const option1 = screen.getByText('Option 1');
      await user.click(option1);
      
      expect(mockOnSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it('does not call onSelect for disabled options', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      const disabledOption = screen.getByText('Option 3');
      await user.click(disabledOption);
      
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('closes menu after selection by default', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      const option1 = screen.getByText('Option 1');
      await user.click(option1);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('stays open after selection when closeOnSelect is false', async () => {
      render(
        <Dropdown 
          items={mockItems} 
          onSelect={mockOnSelect} 
          closeOnSelect={false}
        />
      );
      
      await user.click(screen.getByRole('button'));
      
      const option1 = screen.getByText('Option 1');
      await user.click(option1);
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens menu with Enter key', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      trigger.focus();
      
      await user.keyboard('{Enter}');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens menu with Space key', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      const trigger = screen.getByRole('button');
      trigger.focus();
      
      await user.keyboard('{ }');
      
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('navigates options with Arrow keys', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      await user.keyboard('{ArrowDown}');
      
      const firstOption = screen.getAllByRole('option')[0];
      expect(firstOption).toHaveClass('bg-gray-100');
      
      await user.keyboard('{ArrowDown}');
      
      const secondOption = screen.getAllByRole('option')[1];
      expect(secondOption).toHaveClass('bg-gray-100');
    });

    it('selects option with Enter key', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(mockOnSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it('selects option with Space key', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ }');
      
      expect(mockOnSelect).toHaveBeenCalledWith(mockItems[0]);
    });

    it('wraps navigation when reaching end of list', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      // Navigate to last option
      for (let i = 0; i < mockItems.length; i++) {
        await user.keyboard('{ArrowDown}');
      }
      
      // Should wrap to first option
      await user.keyboard('{ArrowDown}');
      
      const firstOption = screen.getAllByRole('option')[0];
      expect(firstOption).toHaveClass('bg-gray-100');
    });
  });

  describe('Search Functionality', () => {
    it('shows search input when searchable is true', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} searchable />
      );
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('filters options based on search term', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} searchable />
      );
      
      await user.click(screen.getByRole('button'));
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Option 1');
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });

    it('filters options based on description', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} searchable />
      );
      
      await user.click(screen.getByRole('button'));
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Description');
      
      expect(screen.getByText('Option 4')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('shows no results message when no options match', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} searchable />
      );
      
      await user.click(screen.getByRole('button'));
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Nonexistent');
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('focuses search input when dropdown opens', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} searchable />
      );
      
      await user.click(screen.getByRole('button'));
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when open', async () => {
      const { container } = render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} />
      );
      
      await user.click(screen.getByRole('button'));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('sets aria-selected for selected option', async () => {
      render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} value="option2" />
      );
      
      await user.click(screen.getByRole('button'));
      
      const selectedOption = screen.getByText('Option 2').closest('[role="option"]');
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-activedescendant for highlighted option', async () => {
      render(<Dropdown items={mockItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      await user.keyboard('{ArrowDown}');
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-activedescendant', 'dropdown-item-1');
    });

    it('supports custom aria-label', () => {
      render(
        <Dropdown 
          items={mockItems} 
          onSelect={mockOnSelect} 
          aria-label="Custom dropdown label"
        />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', 'Custom dropdown label');
    });

    it('supports custom aria-describedby', () => {
      render(
        <Dropdown 
          items={mockItems} 
          onSelect={mockOnSelect} 
          aria-describedby="dropdown-description"
        />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-describedby', 'dropdown-description');
    });
  });

  describe('Variants and Sizes', () => {
    it('applies size classes correctly', () => {
      const { rerender } = render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} size="sm" />
      );
      
      let trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('px-2 py-1 text-sm min-h-[32px]');
      
      rerender(
        <Dropdown items={mockItems} onSelect={mockOnSelect} size="lg" />
      );
      
      trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('px-4 py-3 text-base min-h-[48px]');
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(
        <Dropdown items={mockItems} onSelect={mockOnSelect} variant="outline" />
      );
      
      let trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('border border-gray-300 bg-white hover:bg-gray-50');
      
      rerender(
        <Dropdown items={mockItems} onSelect={mockOnSelect} variant="ghost" />
      );
      
      trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('bg-transparent hover:bg-gray-100');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', async () => {
      render(<Dropdown items={[]} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('handles single item', async () => {
      const singleItem = [mockItems[0]];
      render(<Dropdown items={singleItem} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('handles items with special characters', async () => {
      const specialItems = [
        { id: '1', label: 'Option & Special', value: 'special' },
        { id: '2', label: 'Option "Quotes"', value: 'quotes' },
      ];
      
      render(<Dropdown items={specialItems} onSelect={mockOnSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('Option & Special')).toBeInTheDocument();
      expect(screen.getByText('Option "Quotes"')).toBeInTheDocument();
    });
  });
});
