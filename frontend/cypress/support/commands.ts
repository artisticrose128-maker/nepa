// Custom Cypress commands

// @ts-ignore
Cypress.Commands.add('login', (email: string, password: string) => {
  // @ts-ignore
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      user: { id: '1', email, name: 'Test User' },
      token: 'mock_token'
    }
  }).as('loginRequest');

  // @ts-ignore
  cy.get('#email').type(email);
  // @ts-ignore
  cy.get('#password').type(password);
  // @ts-ignore
  cy.get('button[type="submit"]').click();

  // @ts-ignore
  cy.wait('@loginRequest');
  // @ts-ignore
  cy.url().should('include', '/dashboard');
});

// @ts-ignore
Cypress.Commands.add('loginWithWallet', () => {
  // @ts-ignore
  cy.window().then((win: any) => {
    win.stellar = {
      getPublicKey: () => Promise.resolve('GD1234567890abcdef'),
      signTransaction: () => Promise.resolve('signed_transaction'),
    };
  });

  // @ts-ignore
  cy.intercept('POST', '**/api/auth/wallet', {
    statusCode: 200,
    body: {
      success: true,
      user: { id: '1', email: 'wallet@example.com', name: 'Wallet User' },
      token: 'mock_wallet_token'
    }
  }).as('walletRequest');

  // @ts-ignore
  cy.get('button').contains('Connect Wallet').click();
  // @ts-ignore
  cy.wait('@walletRequest');
  // @ts-ignore
  cy.url().should('include', '/dashboard');
});

// @ts-ignore
Cypress.Commands.add('mockApiResponse', (endpoint: string, response: any) => {
  // @ts-ignore
  cy.intercept(endpoint, response).as(`mock-${endpoint}`);
});

// Global beforeEach to set up common mocks
// @ts-ignore
beforeEach(() => {
  // Set up localStorage for authenticated state
  // @ts-ignore
  cy.window().then((win: any) => {
    win.localStorage.setItem('authToken', 'mock_token');
    win.localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
});
