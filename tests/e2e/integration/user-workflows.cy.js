describe('User Workflow E2E Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.waitForPageLoad();
  });

  describe('Dashboard Workflow', () => {
    it('should display dashboard with all components', () => {
      cy.visit('/dashboard');
      cy.waitForApi('getDashboardData');
      
      // Check main dashboard components
      cy.getByTestId('dashboard-header').should('be.visible');
      cy.getByTestId('stats-cards').should('be.visible');
      cy.getByTestId('charts-container').should('be.visible');
      cy.getByTestId('recent-activity').should('be.visible');
      
      cy.checkAccessibility();
    });

    it('should load dashboard data correctly', () => {
      cy.visit('/dashboard');
      cy.waitForApi('getDashboardData');
      
      // Check if data is loaded
      cy.getByTestId('total-users').should('contain.text', '1,234');
      cy.getByTestId('active-users').should('contain.text', '567');
      cy.getByTestId('total-transactions').should('contain.text', '8,901');
      
      // Check charts
      cy.getByTestId('revenue-chart').should('be.visible');
      cy.getByTestId('user-growth-chart').should('be.visible');
    });

    it('should refresh dashboard data', () => {
      cy.visit('/dashboard');
      cy.waitForApi('getDashboardData');
      
      cy.getByTestId('refresh-btn').click();
      cy.waitForApi('getDashboardData');
      
      // Should show loading state then updated data
      cy.getByTestId('dashboard-header').should('be.visible');
    });

    it('should handle dashboard responsive design', () => {
      cy.checkResponsive(() => {
        cy.visit('/dashboard');
        cy.waitForApi('getDashboardData');
        
        cy.getByTestId('dashboard-header').should('be.visible');
        cy.getByTestId('stats-cards').should('be.visible');
        
        // Check responsive behavior
        if (Cypress.config('viewportWidth') < 768) {
          cy.getByTestId('mobile-menu').should('be.visible');
        } else {
          cy.getByTestId('sidebar').should('be.visible');
        }
      });
    });
  });

  describe('Profile Management Workflow', () => {
    it('should view and edit user profile', () => {
      cy.visit('/profile');
      cy.waitForApi('getUserProfile');
      
      // Check profile is loaded
      cy.getByTestId('profile-form').should('be.visible');
      cy.get('input[name="firstName"]').should('have.value', 'Test');
      cy.get('input[name="lastName"]').should('have.value', 'User');
      cy.get('input[name="email"]').should('have.value', 'test@example.com');
      
      // Edit profile
      cy.fillForm({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890'
      });
      
      cy.getByTestId('save-profile').click();
      cy.checkToast('Profile updated successfully', 'success');
      
      // Verify changes
      cy.get('input[name="firstName"]').should('have.value', 'John');
      cy.get('input[name="lastName"]').should('have.value', 'Doe');
    });

    it('should validate profile form inputs', () => {
      cy.visit('/profile');
      
      // Try to submit with invalid data
      cy.fillForm({
        firstName: '',
        lastName: '',
        email: 'invalid-email'
      });
      
      cy.getByTestId('save-profile').click();
      cy.checkValidationErrors([
        'First name is required',
        'Last name is required',
        'Please enter a valid email'
      ]);
    });

    it('should upload profile picture', () => {
      cy.visit('/profile');
      
      cy.uploadFile('input[type="file"]', 'profile-picture.png');
      cy.getByTestId('upload-avatar').click();
      
      cy.checkToast('Profile picture updated', 'success');
      cy.getByTestId('profile-avatar').should('be.visible');
    });

    it('should handle profile picture upload errors', () => {
      cy.visit('/profile');
      
      // Mock upload error
      cy.intercept('POST', '/api/user/upload-avatar', {
        statusCode: 400,
        body: { error: 'Invalid file format' }
      }).as('uploadError');
      
      cy.uploadFile('input[type="file"]', 'invalid-file.txt');
      cy.getByTestId('upload-avatar').click();
      
      cy.wait('@uploadError');
      cy.checkToast('Invalid file format', 'error');
    });
  });

  describe('Settings Workflow', () => {
    it('should update user preferences', () => {
      cy.visit('/settings');
      
      // Change theme
      cy.getByTestId('theme-selector').select('dark');
      
      // Change language
      cy.getByTestId('language-selector').select('es');
      
      // Toggle notifications
      cy.getByTestId('email-notifications').check();
      cy.getByTestId('push-notifications').uncheck();
      
      cy.getByTestId('save-settings').click();
      cy.checkToast('Settings saved', 'success');
      
      // Verify changes
      cy.getByTestId('theme-selector').should('have.value', 'dark');
      cy.getByTestId('language-selector').should('have.value', 'es');
    });

    it('should reset settings to defaults', () => {
      cy.visit('/settings');
      
      // Change some settings
      cy.getByTestId('theme-selector').select('dark');
      cy.getByTestId('language-selector').select('es');
      
      // Reset to defaults
      cy.getByTestId('reset-settings').click();
      cy.getByTestId('confirm-reset').click();
      
      cy.checkToast('Settings reset to defaults', 'success');
      cy.getByTestId('theme-selector').should('have.value', 'light');
      cy.getByTestId('language-selector').should('have.value', 'en');
    });

    it('should handle password change', () => {
      cy.visit('/settings/security');
      
      cy.fillForm({
        currentPassword: 'Test123!@#',
        newPassword: 'NewPass123!@#',
        confirmPassword: 'NewPass123!@#'
      });
      
      cy.getByTestId('change-password').click();
      cy.checkToast('Password changed successfully', 'success');
      
      // Should logout and require re-login
      cy.urlShouldContain('/login');
    });

    it('should validate password change requirements', () => {
      cy.visit('/settings/security');
      
      cy.fillForm({
        currentPassword: 'Test123!@#',
        newPassword: 'weak',
        confirmPassword: 'weak'
      });
      
      cy.getByTestId('change-password').click();
      cy.checkValidationErrors([
        'New password must be at least 8 characters long',
        'New password must contain uppercase, lowercase, number, and special character'
      ]);
    });
  });

  describe('Payment Workflow', () => {
    it('should view payment history', () => {
      cy.visit('/payments');
      cy.waitForApi('getPaymentHistory');
      
      // Check payment history table
      cy.getByTestId('payment-table').should('be.visible');
      cy.getByTestId('payment-row').should('have.length.greaterThan', 0);
      
      // Check payment details
      cy.getByTestId('payment-1').should('contain.text', '$99.99');
      cy.getByTestId('payment-1').should('contain.text', 'completed');
    });

    it('should filter payment history', () => {
      cy.visit('/payments');
      cy.waitForApi('getPaymentHistory');
      
      // Filter by status
      cy.getByTestId('status-filter').select('completed');
      cy.getByTestId('apply-filters').click();
      
      // Should show only completed payments
      cy.getByTestId('payment-row').each(($row) => {
        cy.wrap($row).should('contain.text', 'completed');
      });
      
      // Filter by date range
      cy.getByTestId('date-filter').select('last-30-days');
      cy.getByTestId('apply-filters').click();
      
      cy.waitForApi('getPaymentHistory');
    });

    it('should export payment data', () => {
      cy.visit('/payments');
      
      cy.getByTestId('export-btn').click();
      cy.getByTestId('export-format').select('csv');
      cy.getByTestId('confirm-export').click();
      
      // Should trigger download
      cy.checkToast('Payment data exported successfully', 'success');
    });

    it('should process new payment', () => {
      cy.visit('/payments/new');
      
      cy.fillForm({
        amount: '100.00',
        currency: 'USD',
        description: 'Test payment'
      });
      
      cy.getByTestId('process-payment').click();
      
      // Should show payment confirmation
      cy.getByTestId('payment-confirmation').should('be.visible');
      cy.getByTestId('confirm-payment').click();
      
      cy.checkToast('Payment processed successfully', 'success');
      cy.urlShouldContain('/payments');
    });

    it('should validate payment form', () => {
      cy.visit('/payments/new');
      
      cy.getByTestId('process-payment').click();
      
      cy.checkValidationErrors([
        'Amount is required',
        'Currency is required',
        'Description is required'
      ]);
    });
  });

  describe('Search and Filter Workflow', () => {
    it('should search across the application', () => {
      cy.visit('/dashboard');
      
      cy.getByTestId('search-input').type('payment');
      cy.getByTestId('search-btn').click();
      
      // Should show search results
      cy.getByTestId('search-results').should('be.visible');
      cy.getByTestId('search-result-item').should('have.length.greaterThan', 0);
    });

    it('should handle no search results', () => {
      cy.visit('/dashboard');
      
      cy.getByTestId('search-input').type('nonexistent');
      cy.getByTestId('search-btn').click();
      
      cy.getByTestId('no-results').should('be.visible');
      cy.getByTestId('no-results').should('contain.text', 'No results found');
    });

    it('should use advanced search filters', () => {
      cy.visit('/dashboard');
      
      cy.getByTestId('advanced-search').click();
      cy.getByTestId('date-range-filter').select('last-7-days');
      cy.getByTestId('status-filter').select('active');
      cy.getByTestId('category-filter').select('payments');
      
      cy.getByTestId('apply-advanced-search').click();
      
      cy.waitForApi('searchResults');
      cy.getByTestId('search-results').should('be.visible');
    });
  });

  describe('Notification Workflow', () => {
    it('should display notifications', () => {
      cy.visit('/dashboard');
      
      // Check notification bell
      cy.getByTestId('notification-bell').should('be.visible');
      cy.getByTestId('notification-count').should('contain.text', '3');
      
      // Click to show notifications
      cy.getByTestId('notification-bell').click();
      cy.getByTestId('notification-dropdown').should('be.visible');
      cy.getByTestId('notification-item').should('have.length.greaterThan', 0);
    });

    it('should mark notifications as read', () => {
      cy.visit('/dashboard');
      
      cy.getByTestId('notification-bell').click();
      cy.getByTestId('notification-item').first().click();
      
      // Should mark as read
      cy.getByTestId('notification-item').first().should('not.have.class', 'unread');
      cy.getByTestId('notification-count').should('not.exist');
    });

    it('should clear all notifications', () => {
      cy.visit('/dashboard');
      
      cy.getByTestId('notification-bell').click();
      cy.getByTestId('clear-notifications').click();
      cy.getByTestId('confirm-clear').click();
      
      cy.checkToast('All notifications cleared', 'success');
      cy.getByTestId('notification-dropdown').should('not.contain', 'notification-item');
    });

    it('should handle notification preferences', () => {
      cy.visit('/settings/notifications');
      
      // Configure notification preferences
      cy.getByTestId('email-notifications').check();
      cy.getByTestId('payment-notifications').check();
      cy.getByTestId('security-notifications').uncheck();
      
      cy.getByTestId('save-notification-settings').click();
      cy.checkToast('Notification preferences saved', 'success');
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', '/api/user/profile', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/profile');
      cy.wait('@networkError');
      
      cy.getByTestId('error-message').should('be.visible');
      cy.getByTestId('error-message').should('contain.text', 'Network error');
      cy.getByTestId('retry-btn').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      // Simulate server error
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.visit('/profile');
      cy.wait('@serverError');
      
      cy.getByTestId('error-message').should('be.visible');
      cy.getByTestId('error-message').should('contain.text', 'Something went wrong');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '/api/user/profile', { forceNetworkError: true }).as('networkError');
      cy.intercept('GET', '/api/user/profile', {
        statusCode: 200,
        body: { user: { id: 'test-user', email: 'test@example.com' } }
      }).as('success');
      
      cy.visit('/profile');
      cy.wait('@networkError');
      
      cy.getByTestId('retry-btn').click();
      cy.wait('@success');
      
      cy.getByTestId('profile-form').should('be.visible');
    });
  });
});
