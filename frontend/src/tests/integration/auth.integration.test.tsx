import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../../components/LoginForm';
import RegisterForm from '../../components/RegisterForm';

// Mock the auth context implementation
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLoginWithWallet = jest.fn();
const mockLogout = jest.fn();

const createMockAuthContext = (initialUser = null) => ({
  user: initialUser,
  isLoading: false,
  login: mockLogin,
  register: mockRegister,
  loginWithWallet: mockLoginWithWallet,
  logout: mockLogout,
  isAuthenticated: !!initialUser,
});

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = createMockAuthContext();
  return (
    <AuthProvider value={authContext}>
      {children}
    </AuthProvider>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    test('complete login flow with valid credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      // Fill in login form
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

    test('login flow with two-factor authentication', async () => {
      const user = userEvent.setup();
      mockLogin
        .mockResolvedValueOnce({ requiresTwoFactor: true })
        .mockResolvedValueOnce({ success: true });
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      // Initial login attempt
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      // Wait for 2FA field to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Two-Factor Code/i)).toBeInTheDocument();
      });
      
      // Enter 2FA code
      const twoFactorInput = screen.getByLabelText(/Two-Factor Code/i);
      await user.type(twoFactorInput, '123456');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          twoFactorCode: '123456',
        });
      });
    });

    test('wallet login flow', async () => {
      const user = userEvent.setup();
      mockLoginWithWallet.mockResolvedValue({ success: true });
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      const walletButton = screen.getByRole('button', { name: 'Connect Wallet' });
      await user.click(walletButton);
      
      await waitFor(() => {
        expect(mockLoginWithWallet).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Registration Flow', () => {
    test('complete registration flow with valid data', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });
      
      render(
        <MockAuthProvider>
          <RegisterForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      // Fill in registration form
      const nameInput = screen.getByLabelText(/Full Name/i);
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });
    });

    test('registration flow validation', async () => {
      const user = userEvent.setup();
      
      render(
        <MockAuthProvider>
          <RegisterForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
      
      // Should not call register
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Mode Switching', () => {
    test('switches between login and register modes', async () => {
      const user = userEvent.setup();
      const mockToggleMode = jest.fn();
      
      const { rerender } = render(
        <MockAuthProvider>
          <LoginForm onToggleMode={mockToggleMode} />
        </MockAuthProvider>
      );
      
      // Click sign up link
      const signUpLink = screen.getByText('Sign up');
      await user.click(signUpLink);
      
      expect(mockToggleMode).toHaveBeenCalledTimes(1);
      
      // Simulate mode switch by rendering RegisterForm
      rerender(
        <MockAuthProvider>
          <RegisterForm onToggleMode={mockToggleMode} />
        </MockAuthProvider>
      );
      
      // Should now show registration form
      expect(screen.getByText(/Create your NEPA account/i)).toBeInTheDocument();
      
      // Click sign in link
      const signInLink = screen.getByText('Sign in');
      await user.click(signInLink);
      
      expect(mockToggleMode).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('handles login errors gracefully', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
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

    test('handles network errors', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Network error'));
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during authentication', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      ));
      
      render(
        <MockAuthProvider>
          <LoginForm onToggleMode={() => {}} />
        </MockAuthProvider>
      );
      
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
    });
  });
});
