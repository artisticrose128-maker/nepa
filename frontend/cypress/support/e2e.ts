// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global Cypress type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): any;
      loginWithWallet(): any;
      mockApiResponse(endpoint: string, response: any): any;
    }
  }
}
