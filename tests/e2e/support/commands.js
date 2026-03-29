// Custom Cypress commands

// Login command with authentication
Cypress.Commands.add('login', (email, password) => {
  const userEmail = email || Cypress.env('testUser').email;
  const userPassword = password || Cypress.env('testUser').password;
  
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').clear().type(userEmail);
  cy.get('input[name="password"], input[type="password"]').clear().type(userPassword);
  cy.get('button[type="submit"], .login-btn, button:contains("Login")').click();
  
  // Wait for login to complete
  cy.url().should('not.include', '/login');
  cy.window().its('localStorage').should('contain', 'authToken');
});

// Registration command
Cypress.Commands.add('register', (userData) => {
  const user = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    ...userData
  };
  
  cy.visit('/register');
  cy.get('input[name="firstName"], input[placeholder*="First"], input[placeholder*="first"]').clear().type(user.firstName);
  cy.get('input[name="lastName"], input[placeholder*="Last"], input[placeholder*="last"]').clear().type(user.lastName);
  cy.get('input[name="email"], input[type="email"]').clear().type(user.email);
  cy.get('input[name="password"], input[type="password"]').clear().type(user.password);
  cy.get('button[type="submit"], .register-btn, button:contains("Register")').click();
  
  // Wait for registration to complete
  cy.url().should('not.include', '/register');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout"], .logout-btn, button:contains("Logout"), a:contains("Logout")')
    .should('be.visible')
    .click({ force: true });
  
  // Wait for logout to complete
  cy.url().should('include', '/login');
  cy.window().its('localStorage').should('not.contain', 'authToken');
});

// Navigate to specific page
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path);
  cy.url().should('include', path);
});

// Wait for API call
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`, { timeout: 10000 });
});

// Fill form with data
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`)
      .should('be.visible')
      .clear()
      .type(value.toString());
  });
});

// Check if element exists and is visible
Cypress.Commands.add('isVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

// Check if element does not exist
Cypress.Commands.add('notExists', (selector) => {
  cy.get(selector).should('not.exist');
});

// Check text content
Cypress.Commands.add('hasText', (selector, text) => {
  cy.get(selector).should('contain.text', text);
});

// Check if element is disabled
Cypress.Commands.add('isDisabled', (selector) => {
  cy.get(selector).should('be.disabled');
});

// Check if element is enabled
Cypress.Commands.add('isEnabled', (selector) => {
  cy.get(selector).should('not.be.disabled');
});

// Wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.loading, .spinner, [data-loading="true"]').should('not.exist');
  cy.get('[data-testid="loading"]').should('not.exist');
});

// Mock authentication
Cypress.Commands.add('mockAuth', (userData = {}) => {
  const user = {
    id: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    ...userData
  };
  
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', 'mock-jwt-token');
    win.localStorage.setItem('user', JSON.stringify(user));
    win.localStorage.setItem('isAuthenticated', 'true');
  });
});

// Check form validation errors
Cypress.Commands.add('checkValidationErrors', (expectedErrors) => {
  expectedErrors.forEach((error) => {
    cy.get('.error-message, .validation-error, [data-testid="error"]')
      .should('contain.text', error);
  });
});

// Check toast/notification messages
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get(`.toast, .notification, [data-testid="toast"], .alert-${type}`)
    .should('be.visible')
    .should('contain.text', message);
});

// Upload file
Cypress.Commands.add('uploadFile', (selector, fileName, mimeType = 'image/png') => {
  cy.get(selector).then((subject) => {
    cy.fixture(fileName, 'base64').then((content) => {
      const blob = Cypress.Blob.base64StringToBlob(content, mimeType);
      const file = new File([blob], fileName, { type: mimeType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      subject[0].files = dataTransfer.files;
    });
  });
});

// Check responsive design
Cypress.Commands.add('checkResponsive', (testFunction) => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
    { width: 1920, height: 1080, name: 'large' }
  ];
  
  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height);
    cy.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
    testFunction();
  });
});

// Check accessibility
Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('h1').should('exist');
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt');
  });
  cy.get('button, a, input, select, textarea').each(($el) => {
    const tag = $el.prop('tagName').toLowerCase();
    if (tag === 'button' || tag === 'a') {
      cy.wrap($el).should('not.be.disabled');
    }
  });
});

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.document().its('readyState').should('eq', 'complete');
  cy.get('body').should('be.visible');
  cy.waitForLoading();
});

// Check if URL contains specific path
Cypress.Commands.add('urlShouldContain', (path) => {
  cy.url().should('include', path);
});

// Check if URL does not contain specific path
Cypress.Commands.add('urlShouldNotContain', (path) => {
  cy.url().should('not.include', path);
});

// Get data-testid element
Cypress.Commands.add('getByTestId', (testId) => {
  cy.get(`[data-testid="${testId}"]`);
});

// Click element with data-testid
Cypress.Commands.add('clickByTestId', (testId) => {
  cy.getByTestId(testId).click();
});

// Type in element with data-testid
Cypress.Commands.add('typeByTestId', (testId, text) => {
  cy.getByTestId(testId).type(text);
});
