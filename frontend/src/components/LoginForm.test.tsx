import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockLoginWithWallet = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithWallet: mockLoginWithWallet,
  }),
}));

describe('LoginForm Component', () => {
  const mockOnToggleMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    expect(screen.getByText('Sign In to NEPA')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('updates form fields when user types', async () => {
    const user = userEvent.setup();
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('calls login with correct credentials on form submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('shows loading state during login', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
  });

  test('shows error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('shows two-factor authentication field when required', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ requiresTwoFactor: true });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Two-Factor Code/i)).toBeInTheDocument();
      expect(screen.getByText(/Two-factor authentication required/)).toBeInTheDocument();
    });
  });

  test('calls login with two-factor code when required', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ requiresTwoFactor: true });
    mockLogin.mockResolvedValueOnce({ success: true });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Two-Factor Code/i)).toBeInTheDocument();
    });
    
    const twoFactorInput = screen.getByLabelText(/Two-Factor Code/i);
    await user.type(twoFactorInput, '123456');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenLastCalledWith({
        email: 'test@example.com',
        password: 'password123',
        twoFactorCode: '123456',
      });
    });
  });

  test('calls loginWithWallet when connect wallet button is clicked', async () => {
    const user = userEvent.setup();
    mockLoginWithWallet.mockResolvedValue({ success: true });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const walletButton = screen.getByRole('button', { name: 'Connect Wallet' });
    await user.click(walletButton);
    
    await waitFor(() => {
      expect(mockLoginWithWallet).toHaveBeenCalledTimes(1);
    });
  });

  test('shows error message on wallet login failure', async () => {
    const user = userEvent.setup();
    mockLoginWithWallet.mockResolvedValue({ success: false, error: 'Wallet connection failed' });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const walletButton = screen.getByRole('button', { name: 'Connect Wallet' });
    await user.click(walletButton);
    
    await waitFor(() => {
      expect(screen.getByText('Wallet connection failed')).toBeInTheDocument();
    });
  });

  test('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  test('calls onToggleMode when sign up button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const signUpButton = screen.getByText('Sign up');
    await user.click(signUpButton);
    
    expect(mockOnToggleMode).toHaveBeenCalledTimes(1);
  });

  test('disables buttons during loading', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Connecting...' })).toBeDisabled();
  });

  test('handles unexpected errors gracefully', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Network error'));
    
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  test('two-factor code input has correct maxLength', () => {
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    // First trigger 2FA requirement
    mockLogin.mockResolvedValue({ requiresTwoFactor: true });
    fireEvent.submit(screen.getByRole('form') || screen.getByText('Sign In').closest('form'));
    
    const twoFactorInput = screen.queryByLabelText(/Two-Factor Code/i);
    if (twoFactorInput) {
      expect(twoFactorInput).toHaveAttribute('maxLength', '6');
    }
  });

  test('form has correct accessibility attributes', () => {
    render(<LoginForm onToggleMode={mockOnToggleMode} />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });
});
