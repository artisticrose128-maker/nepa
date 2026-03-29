// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Mock API responses for consistent testing
  cy.intercept('GET', '/api/user/profile', { fixture: 'user-profile.json' }).as('getUserProfile');
  cy.intercept('GET', '/api/analytics/dashboard', { fixture: 'dashboard-data.json' }).as('getDashboardData');
  cy.intercept('GET', '/api/payment/history', { fixture: 'payment-history.json' }).as('getPaymentHistory');
});

afterEach(() => {
  // Clean up after each test
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Custom error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Add custom commands for better test organization
Cypress.Commands.add('login', (email = Cypress.env('testUser').email, password = Cypress.env('testUser').password) => {
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').type(password);
  cy.get('button[type="submit"], .login-btn').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('register', (userData) => {
  const user = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Test123!@#',
    ...userData
  };
  
  cy.visit('/register');
  cy.get('input[name="firstName"], input[placeholder*="First"]').type(user.firstName);
  cy.get('input[name="lastName"], input[placeholder*="Last"]').type(user.lastName);
  cy.get('input[name="email"], input[type="email"]').type(user.email);
  cy.get('input[name="password"], input[type="password"]').type(user.password);
  cy.get('button[type="submit"], .register-btn').click();
  cy.url().should('not.include', '/register');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout"], .logout-btn, button:contains("Logout")').click({ force: true });
  cy.url().should('include', '/login');
});

Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path);
  cy.url().should('include', path);
});

Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`, { timeout: 10000 });
});

Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('h1, h2, h3, h4, h5, h6').should('have.length.greaterThan', 0);
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt');
  });
  cy.get('button, a, input, select, textarea').each(($el) => {
    cy.wrap($el).should('not.be.disabled');
  });
});

// Add visual regression testing support
Cypress.Commands.add('compareScreenshot', (name, options = {}) => {
  const defaultOptions = {
    capture: 'viewport',
    errorThreshold: 0.1,
    padding: 0,
    ...options
  };
  
  cy.compareSnapshot(name, defaultOptions);
});
