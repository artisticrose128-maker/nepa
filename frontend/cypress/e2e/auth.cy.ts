describe('Authentication Cypress Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('h2', 'Sign In to NEPA').should('be.visible');
    cy.get('label[for="email"]').should('be.visible');
    cy.get('label[for="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Sign In').should('be.visible');
    cy.get('button').contains('Connect Wallet').should('be.visible');
  });

  it('should show validation errors for empty form', () => {
    cy.get('button[type="submit"]').click();
    
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should toggle between login and register modes', () => {
    cy.contains('Sign up').click();
    
    cy.contains('h2', /Create your NEPA account/i).should('be.visible');
    cy.get('label[for="name"]').should('be.visible');
    cy.get('label[for="confirmPassword"]').should('be.visible');
    
    cy.contains('Sign in').click();
    
    cy.contains('h2', 'Sign In to NEPA').should('be.visible');
  });

  it('should validate email format', () => {
    cy.get('#email').type('invalid-email');
    cy.get('#email').blur();
    
    cy.contains('Please enter a valid email address').should('be.visible');
  });

  it('should validate password strength', () => {
    cy.get('#password').type('123');
    cy.get('#password').blur();
    
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('should handle successful login', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, user: { id: '1', email: 'test@example.com' } }
    }).as('loginRequest');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should handle login failure', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { success: false, error: 'Invalid credentials' }
    }).as('loginRequest');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should handle two-factor authentication', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { requiresTwoFactor: true }
    }).as('loginRequest');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.get('#twoFactorCode').should('be.visible');
    cy.contains('Two-factor authentication required').should('be.visible');
  });

  it('should handle wallet connection', () => {
    cy.window().then((win) => {
      win.stellar = {
        getPublicKey: () => Promise.resolve('GD1234567890abcdef'),
        signTransaction: () => Promise.resolve('signed_transaction'),
      };
    });

    cy.intercept('POST', '**/api/auth/wallet', {
      statusCode: 200,
      body: { success: true, user: { id: '1', email: 'wallet@example.com' } }
    }).as('walletRequest');

    cy.get('button').contains('Connect Wallet').click();
    
    cy.wait('@walletRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should handle network errors', () => {
    cy.intercept('POST', '**/api/auth/login', { forceNetworkError: true }).as('loginRequest');

    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.contains('An unexpected error occurred').should('be.visible');
  });

  it('should be accessible via keyboard navigation', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'id', 'email');
    
    cy.get('body').tab();
    cy.focused().should('have.attr', 'id', 'password');
    
    cy.get('body').tab();
    cy.focused().should('contain', 'Sign In');
    
    cy.focused().type('{enter}');
    cy.contains('Email is required').should('be.visible');
  });

  it('should have proper ARIA attributes', () => {
    cy.get('form').should('have.attr', 'role', 'form');
    cy.get('#email').should('have.attr', 'type', 'email');
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('button[type="submit"]').should('have.attr', 'type', 'submit');
  });

  it('should handle responsive design', () => {
    // Mobile view
    cy.viewport('iphone-x');
    cy.contains('h2', 'Sign In to NEPA').should('be.visible');
    
    // Tablet view
    cy.viewport('ipad-2');
    cy.contains('h2', 'Sign In to NEPA').should('be.visible');
    
    // Desktop view
    cy.viewport(1280, 720);
    cy.contains('h2', 'Sign In to NEPA').should('be.visible');
  });

  it('should maintain form state during validation errors', () => {
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Mock validation error
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 400,
      body: { success: false, error: 'Validation failed' }
    }).as('loginRequest');

    cy.wait('@loginRequest');
    
    // Form values should be preserved
    cy.get('#email').should('have.value', 'test@example.com');
    cy.get('#password').should('have.value', 'password123');
  });

  it('should clear error when user starts typing', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { success: false, error: 'Invalid credentials' }
    }).as('loginRequest');

    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
    
    cy.get('#email').clear().type('correct@example.com');
    cy.contains('Invalid credentials').should('not.exist');
  });
});
