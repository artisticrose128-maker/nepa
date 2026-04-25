const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshot: 'only-on-failure',
    videoUploadOnPasses: false,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    execTimeout: 60000,
    taskTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      // Environment variables
      apiUrl: 'http://localhost:3000/api',
      // Test credentials
      testUser: {
        email: 'test@example.com',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User'
      }
    },
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        // Custom tasks for database cleanup, etc.
        clearDatabase() {
          // Implementation for clearing test data
          return null;
        },
        
        seedDatabase() {
          // Implementation for seeding test data
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      port: 3000
    }
  }
});
