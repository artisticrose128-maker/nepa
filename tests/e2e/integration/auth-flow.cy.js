describe('Authentication Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', () => {
      cy.login();
      cy.urlShouldNotContain('/login');
      cy.checkAccessibility();
      cy.getByTestId('user-menu').should('be.visible');
      cy.getByTestId('user-name').should('contain.text', 'Test User');
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/login');
      cy.fillForm({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      cy.get('button[type="submit"], .login-btn').click();
      
      cy.checkToast('Invalid credentials', 'error');
      cy.urlShouldContain('/login');
    });

    it('should validate required fields', () => {
      cy.visit('/login');
      cy.get('button[type="submit"], .login-btn').click();
      
      cy.checkValidationErrors(['Email is required', 'Password is required']);
    });

    it('should validate email format', () => {
      cy.visit('/login');
      cy.fillForm({
        email: 'invalid-email',
        password: 'password123'
      });
      cy.get('button[type="submit"], .login-btn').click();
      
      cy.checkValidationErrors(['Please enter a valid email']);
    });

    it('should redirect to dashboard after login', () => {
      cy.login();
      cy.urlShouldContain('/dashboard');
      cy.hasText('h1', 'Dashboard');
    });

    it('should remember login state across page refresh', () => {
      cy.login();
      cy.reload();
      cy.urlShouldNotContain('/login');
      cy.getByTestId('user-menu').should('be.visible');
    });
  });

  describe('Registration Flow', () => {
    it('should register successfully with valid data', () => {
      const timestamp = Date.now();
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@example.com`,
        password: 'SecurePass123!'
      };

      cy.register(userData);
      cy.urlShouldNotContain('/register');
      cy.checkToast('Registration successful', 'success');
      cy.checkAccessibility();
    });

    it('should validate required registration fields', () => {
      cy.visit('/register');
      cy.get('button[type="submit"], .register-btn').click();
      
      cy.checkValidationErrors([
        'First name is required',
        'Last name is required',
        'Email is required',
        'Password is required'
      ]);
    });

    it('should validate email uniqueness', () => {
      cy.visit('/register');
      cy.fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com', // Assuming this email already exists
        password: 'Test123!@#'
      });
      cy.get('button[type="submit"], .register-btn').click();
      
      cy.checkToast('Email already exists', 'error');
    });

    it('should validate password strength', () => {
      cy.visit('/register');
      cy.fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'weak' // Weak password
      });
      cy.get('button[type="submit"], .register-btn').click();
      
      cy.checkValidationErrors(['Password must be at least 8 characters long']);
    });

    it('should show password strength indicator', () => {
      cy.visit('/register');
      cy.get('input[name="password"], input[type="password"]').type('Test123!@#');
      cy.getByTestId('password-strength').should('be.visible');
      cy.getByTestId('password-strength').should('contain.text', 'Strong');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      cy.login();
    });

    it('should logout successfully', () => {
      cy.logout();
      cy.urlShouldContain('/login');
      cy.window().its('localStorage').should('not.contain', 'authToken');
    });

    it('should redirect to login after logout', () => {
      cy.logout();
      cy.urlShouldContain('/login');
      cy.hasText('h1, h2', 'Login');
    });

    it('should clear user data after logout', () => {
      cy.logout();
      cy.window().its('localStorage').should('be.empty');
      cy.window().its('sessionStorage').should('be.empty');
    });
  });

  describe('Session Management', () => {
    it('should handle session expiration', () => {
      cy.login();
      
      // Simulate session expiration by clearing token
      cy.window().then((win) => {
        win.localStorage.removeItem('authToken');
      });
      
      // Try to access protected route
      cy.visit('/dashboard');
      cy.urlShouldContain('/login');
      cy.checkToast('Session expired', 'error');
    });

    it('should maintain session across tabs', () => {
      cy.login();
      
      // Open new tab (simulate by visiting same page)
      cy.visit('/dashboard');
      cy.urlShouldNotContain('/login');
      cy.getByTestId('user-menu').should('be.visible');
    });

    it('should handle multiple login attempts', () => {
      // First login
      cy.login();
      cy.logout();
      
      // Second login with different credentials
      cy.visit('/login');
      cy.fillForm({
        email: 'user2@example.com',
        password: 'password456'
      });
      cy.get('button[type="submit"], .login-btn').click();
      
      cy.urlShouldNotContain('/login');
      cy.checkAccessibility();
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset with valid email', () => {
      cy.visit('/forgot-password');
      cy.fillForm({
        email: 'test@example.com'
      });
      cy.get('button[type="submit"], .reset-btn').click();
      
      cy.checkToast('Password reset email sent', 'success');
      cy.urlShouldContain('/forgot-password');
    });

    it('should validate email for password reset', () => {
      cy.visit('/forgot-password');
      cy.fillForm({
        email: 'invalid-email'
      });
      cy.get('button[type="submit"], .reset-btn').click();
      
      cy.checkValidationErrors(['Please enter a valid email']);
    });

    it('should show error for non-existent email', () => {
      cy.visit('/forgot-password');
      cy.fillForm({
        email: 'nonexistent@example.com'
      });
      cy.get('button[type="submit"], .reset-btn').click();
      
      cy.checkToast('Email not found', 'error');
    });
  });

  describe('Two-Factor Authentication', () => {
    beforeEach(() => {
      cy.login();
      // Enable 2FA for testing
      cy.visit('/profile/security');
      cy.getByTestId('enable-2fa').click();
      cy.getByTestId('2fa-setup').should('be.visible');
    });

    it('should enable 2FA successfully', () => {
      cy.getByTestId('2fa-code').type('123456');
      cy.getByTestId('verify-2fa').click();
      
      cy.checkToast('2FA enabled successfully', 'success');
      cy.getByTestId('2fa-status').should('contain.text', 'Enabled');
    });

    it('should require 2FA code on login', () => {
      cy.logout();
      cy.login();
      
      // Should show 2FA input
      cy.getByTestId('2fa-input').should('be.visible');
      cy.getByTestId('2fa-code').type('123456');
      cy.getByTestId('verify-2fa-login').click();
      
      cy.urlShouldNotContain('/login');
    });

    it('should validate 2FA code format', () => {
      cy.logout();
      cy.login();
      
      cy.getByTestId('2fa-code').type('invalid');
      cy.getByTestId('verify-2fa-login').click();
      
      cy.checkValidationErrors(['Please enter a valid 6-digit code']);
    });
  });

  describe('Social Authentication', () => {
    it('should show social login options', () => {
      cy.visit('/login');
      cy.getByTestId('social-login').should('be.visible');
      cy.getByTestId('login-google').should('be.visible');
      cy.getByTestId('login-github').should('be.visible');
    });

    it('should handle social login redirect', () => {
      cy.visit('/login');
      cy.getByTestId('login-google').click();
      
      // Should redirect to OAuth provider
      cy.url().should('include', 'accounts.google.com');
    });

    it('should handle social login callback', () => {
      // Mock successful social login callback
      cy.intercept('GET', '/api/auth/google/callback', {
        statusCode: 200,
        body: { user: { id: 'social-user', email: 'social@example.com' } }
      }).as('socialCallback');
      
      cy.visit('/auth/google/callback');
      cy.wait('@socialCallback');
      
      cy.urlShouldNotContain('/login');
      cy.getByTestId('user-menu').should('be.visible');
    });
  });
});
