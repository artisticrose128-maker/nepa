import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TimePicker from './TimePicker';

describe('TimePicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders time picker with default props', () => {
    render(<TimePicker />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Select time');
    expect(input).toHaveAttribute('aria-label', 'Time picker');
  });

  it('renders with custom props', () => {
    render(
      <TimePicker
        value="09:30 AM"
        onChange={mockOnChange}
        placeholder="Choose time"
        disabled
        className="custom-class"
        id="time-picker"
        aria-label="Custom time picker"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('09:30 AM');
    expect(input).toHaveAttribute('placeholder', 'Choose time');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('id', 'time-picker');
    expect(input).toHaveAttribute('aria-label', 'Custom time picker');
  });

  it('opens dropdown when input is clicked', async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('6:00 PM')).toBeInTheDocument();
    expect(screen.getByText('9:00 PM')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('9:00 AM')).not.toBeInTheDocument();
    });
  });

  it('handles hour changes correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker value="09:30 AM" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Increase hour
    const hourUpButton = screen.getByLabelText('Increase hour');
    await user.click(hourUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('10:30 AM');
    
    // Decrease hour
    const hourDownButton = screen.getByLabelText('Decrease hour');
    await user.click(hourDownButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('09:30 AM');
  });

  it('handles minute changes correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker value="09:30 AM" onChange={mockOnChange} minuteStep={5} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Increase minute
    const minuteUpButton = screen.getByLabelText('Increase minute');
    await user.click(minuteUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('09:35 AM');
    
    // Decrease minute
    const minuteDownButton = screen.getByLabelText('Decrease minute');
    await user.click(minuteDownButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('09:30 AM');
  });

  it('handles AM/PM toggle correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker value="09:30 AM" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Toggle to PM
    const periodButton = screen.getByText('AM');
    await user.click(periodButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('09:30 PM');
  });

  it('handles quick time selection', async () => {
    const user = userEvent.setup();
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Select quick time
    const quickTimeButton = screen.getByText('12:00 PM');
    await user.click(quickTimeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('12:00 PM');
  });

  it('handles manual input correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '2:45 PM');
    
    expect(mockOnChange).toHaveBeenCalledWith('2:45 PM');
  });

  it('handles 24-hour format correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker format12Hour={false} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Should not show AM/PM toggle
    expect(screen.queryByText('AM')).not.toBeInTheDocument();
    expect(screen.queryByText('PM')).not.toBeInTheDocument();
    
    // Increase hour
    const hourUpButton = screen.getByLabelText('Increase hour');
    await user.click(hourUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('01:00');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<TimePicker value="09:30 AM" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Arrow up - increase hour
    await user.keyboard('{ArrowUp}');
    expect(mockOnChange).toHaveBeenCalledWith('10:30 AM');
    
    // Arrow down - decrease hour
    await user.keyboard('{ArrowDown}');
    expect(mockOnChange).toHaveBeenCalledWith('09:30 AM');
    
    // Arrow right - increase minute
    await user.keyboard('{ArrowRight}');
    expect(mockOnChange).toHaveBeenCalledWith('09:31 AM');
    
    // Arrow left - decrease minute
    await user.keyboard('{ArrowLeft}');
    expect(mockOnChange).toHaveBeenCalledWith('09:30 AM');
    
    // Escape - close dropdown
    await user.keyboard('{Escape}');
    expect(screen.queryByText('9:00 AM')).not.toBeInTheDocument();
  });

  it('handles localization correctly', () => {
    render(<TimePicker value="09:30 AM" locale="es-ES" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('09:30 AM');
  });

  it('handles minute step correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker minuteStep={15} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Increase minute by 15
    const minuteUpButton = screen.getByLabelText('Increase minute');
    await user.click(minuteUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('12:15 AM');
  });

  it('handles edge cases correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker value="11:59 PM" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    // Increase minute from 59 should wrap to 00
    const minuteUpButton = screen.getByLabelText('Increase minute');
    await user.click(minuteUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('11:00 PM');
    
    // Increase hour from 11 PM should wrap to 12 AM
    const hourUpButton = screen.getByLabelText('Increase hour');
    await user.click(hourUpButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('12:00 AM');
  });

  it('is accessible with proper ARIA attributes', () => {
    render(<TimePicker aria-describedby="time-description" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-describedby', 'time-description');
  });

  it('applies custom className correctly', () => {
    const { container } = render(<TimePicker className="custom-time-picker" />);
    
    expect(container.querySelector('.custom-time-picker')).toBeInTheDocument();
  });

  it('handles disabled state correctly', async () => {
    const user = userEvent.setup();
    render(<TimePicker disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    
    // Should not open dropdown when clicked
    await user.click(input);
    expect(screen.queryByText('9:00 AM')).not.toBeInTheDocument();
  });

  it('parses various time formats correctly', () => {
    const { rerender } = render(<TimePicker value="9:30 AM" />);
    expect(screen.getByRole('textbox')).toHaveValue('09:30 AM');
    
    rerender(<TimePicker value="14:30" format12Hour={false} />);
    expect(screen.getByRole('textbox')).toHaveValue('14:30');
    
    rerender(<TimePicker value="930 AM" />);
    expect(screen.getByRole('textbox')).toHaveValue('09:30 AM');
  });

  it('handles invalid time input gracefully', async () => {
    const user = userEvent.setup();
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'invalid time');
    
    // Should not call onChange for invalid input
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
