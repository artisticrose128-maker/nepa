import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeToggle } from './ThemeToggle';

// Mock the ThemeContext
const mockSetTheme = jest.fn();
const mockToggleTheme = jest.fn();

jest.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: mockSetTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

// Mock accessibility utilities
jest.mock('../utils/accessibility', () => ({
  ariaLabels: {
    themeToggle: 'Toggle theme',
  },
  getAriaAttributes: {
    expanded: (isOpen: boolean) => ({ 'aria-expanded': isOpen.toString() }),
  },
  keyboardKeys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
  },
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders theme toggle button', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('shows label when showLabel is true', () => {
    render(<ThemeToggle showLabel={true} />);
    
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  test('does not show label when showLabel is false', () => {
    render(<ThemeToggle showLabel={false} />);
    
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
  });

  test('calls toggleTheme when main button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    await user.click(toggleButton);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('opens dropdown when arrow down is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    toggleButton.focus();
    await user.keyboard('{ArrowDown}');
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  test('closes dropdown when escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    toggleButton.focus();
    await user.keyboard('{ArrowDown}');
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('toggles theme when enter or space is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    toggleButton.focus();
    
    await user.keyboard('{Enter}');
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(mockToggleTheme).toHaveBeenCalledTimes(2);
  });

  test('opens dropdown when dropdown button is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Find the dropdown button (the small arrow button)
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  test('sets theme to light when light option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    // Click Light option
    const lightOption = screen.getByRole('menuitem', { name: 'Light' });
    await user.click(lightOption);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    
    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('sets theme to dark when dark option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    // Click Dark option
    const darkOption = screen.getByRole('menuitem', { name: 'Dark' });
    await user.click(darkOption);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  test('sets theme to system when system option is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    // Click System option
    const systemOption = screen.getByRole('menuitem', { name: 'System' });
    await user.click(systemOption);
    
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  test('highlights current theme in dropdown', () => {
    // Mock theme context to return 'dark'
    jest.doMock('../contexts/ThemeContext', () => ({
      useTheme: () => ({
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      }),
    }));
    
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    fireEvent.click(dropdownButton);
    
    const darkOption = screen.getByRole('menuitem', { name: 'Dark' });
    expect(darkOption).toHaveClass('bg-accent', 'text-accent-foreground');
    expect(darkOption).toHaveAttribute('aria-selected', 'true');
  });

  test('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    // Click outside
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('handles keyboard navigation in dropdown', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    // Focus on light option and press Enter
    const lightOption = screen.getByRole('menuitem', { name: 'Light' });
    lightOption.focus();
    await user.keyboard('{Enter}');
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  test('applies custom className', () => {
    const customClass = 'custom-theme-toggle-class';
    const { container } = render(<ThemeToggle className={customClass} />);
    
    const themeToggleContainer = container.firstChild;
    expect(themeToggleContainer).toHaveClass(customClass);
  });

  test('has correct accessibility attributes', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /Toggle theme/ });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('title');
    
    const dropdownButton = screen.getByLabelText('Theme options');
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
    expect(dropdownButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  test('screen reader only text is present', () => {
    render(<ThemeToggle />);
    
    const srOnlyText = screen.getByText('Toggle theme');
    expect(srOnlyText).toHaveClass('sr-only');
  });

  test('dropdown menu has correct role and label', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    // Open dropdown
    const dropdownButton = screen.getByLabelText('Theme options');
    await user.click(dropdownButton);
    
    await waitFor(() => {
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Theme selection menu');
    });
  });
});
