import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    // Mock dashboard data
    await page.route('**/api/dashboard', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalPaid: 15000,
            currentBill: 2500,
            lastPayment: {
              amount: 1000,
              date: '2024-01-15',
              meterNumber: 'METER-123'
            },
            usage: {
              current: 450,
              previous: 380,
              unit: 'kWh'
            },
            savings: {
              total: 500,
              percentage: 10
            }
          }
        }),
      });
    });
    
    await page.goto('/dashboard');
  });

  test('should display dashboard overview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Paid')).toBeVisible();
    await expect(page.getByText('₦15,000')).toBeVisible();
    await expect(page.getByText('Current Bill')).toBeVisible();
    await expect(page.getByText('₦2,500')).toBeVisible();
  });

  test('should display usage statistics', async ({ page }) => {
    await expect(page.getByText('Energy Usage')).toBeVisible();
    await expect(page.getByText('450 kWh')).toBeVisible();
    await expect(page.getByText('Previous: 380 kWh')).toBeVisible();
  });

  test('should display savings information', async ({ page }) => {
    await expect(page.getByText('Your Savings')).toBeVisible();
    await expect(page.getByText('₦500')).toBeVisible();
    await expect(page.getByText('10%')).toBeVisible();
  });

  test('should show last payment details', async ({ page }) => {
    await expect(page.getByText('Last Payment')).toBeVisible();
    await expect(page.getByText('₦1,000')).toBeVisible();
    await expect(page.getByText('METER-123')).toBeVisible();
    await expect(page.getByText('Jan 15, 2024')).toBeVisible();
  });

  test('should navigate to payment form', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await expect(page.getByRole('heading', { name: /Pay Your Bill/i })).toBeVisible();
    await expect(page.getByLabel(/Meter Number/i)).toBeVisible();
  });

  test('should navigate to payment history', async ({ page }) => {
    await page.getByRole('button', { name: /Payment History/i }).click();
    
    await expect(page.getByText('Payment History')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Pay Bill/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Payment History/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View Analytics/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();
  });

  test('should show mobile navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Menu' }).click();
    
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
  });

  test('should handle theme toggle', async ({ page }) => {
    const themeToggle = page.getByLabel(/Toggle theme/i);
    await expect(themeToggle).toBeVisible();
    
    await themeToggle.click();
    
    // Should apply dark theme
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should show user profile menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Test User' }).click();
    
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByText('Logout').click();
    
    await expect(page).toHaveURL('/');
  });

  test('should display notifications', async ({ page }) => {
    // Mock notifications
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          notifications: [
            {
              id: '1',
              type: 'payment_reminder',
              message: 'Your bill is due in 3 days',
              date: '2024-01-15'
            }
          ]
        }),
      });
    });

    await page.getByRole('button', { name: 'Notifications' }).click();
    
    await expect(page.getByText('Your bill is due in 3 days')).toBeVisible();
  });

  test('should handle offline mode', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    await page.reload();
    
    await expect(page.getByText(/Connection Lost/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh Page' })).toBeVisible();
  });

  test('should handle slow connection', async ({ page }) => {
    // Simulate slow connection
    await page.route('**/api/dashboard', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} }),
        });
      }, 5000);
    });

    await page.reload();
    
    await expect(page.getByText('Loading...')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Pay Bill/i })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Payment History/i })).toBeFocused();
    
    // Test ARIA labels
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should display charts and graphs', async ({ page }) => {
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-chart"]')).toBeVisible();
  });

  test('should handle data refresh', async ({ page }) => {
    await page.getByRole('button', { name: 'Refresh' }).click();
    
    // Should show loading state
    await expect(page.getByText('Refreshing...')).toBeVisible();
  });

  test('should display error state on API failure', async ({ page }) => {
    await page.route('**/api/dashboard', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' }),
      });
    });

    await page.reload();
    
    await expect(page.getByText('Server error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should support search functionality', async ({ page }) => {
    await page.getByPlaceholder(/Search/i).fill('payment');
    
    await expect(page.getByText(/Search results for "payment"/i)).toBeVisible();
  });

  test('should handle date range filtering', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter' }).click();
    
    await page.getByLabel(/Start Date/i).fill('2024-01-01');
    await page.getByLabel(/End Date/i).fill('2024-01-31');
    await page.getByRole('button', { name: 'Apply Filter' }).click();
    
    // Should update displayed data
    await expect(page.getByText(/Showing data for Jan 1 - Jan 31/i)).toBeVisible();
  });
});
