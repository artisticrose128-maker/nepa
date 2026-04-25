import { test, expect } from '@playwright/test';

test.describe('Dashboard Visual Regression Tests', () => {
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

  test('should match dashboard overview screenshot', async ({ page }) => {
    await expect(page.locator('main')).toHaveScreenshot('dashboard-overview.png');
  });

  test('should match dashboard with charts screenshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="usage-chart"]');
    await expect(page.locator('main')).toHaveScreenshot('dashboard-charts.png');
  });

  test('should match mobile dashboard screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toHaveScreenshot('dashboard-mobile.png');
  });

  test('should match tablet dashboard screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('main')).toHaveScreenshot('dashboard-tablet.png');
  });

  test('should match dark mode dashboard screenshot', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('main')).toHaveScreenshot('dashboard-dark.png');
  });

  test('should match dashboard with open menu screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('main')).toHaveScreenshot('dashboard-mobile-menu.png');
  });

  test('should match dashboard with user menu screenshot', async ({ page }) => {
    await page.getByRole('button', { name: 'Test User' }).click();
    await expect(page.locator('main')).toHaveScreenshot('dashboard-user-menu.png');
  });

  test('should match dashboard with notifications screenshot', async ({ page }) => {
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
    await expect(page.locator('main')).toHaveScreenshot('dashboard-notifications.png');
  });

  test('should match dashboard loading state screenshot', async ({ page }) => {
    await page.route('**/api/dashboard', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} }),
        });
      }, 2000);
    });

    await page.reload();
    await expect(page.locator('main')).toHaveScreenshot('dashboard-loading.png');
  });

  test('should match dashboard error state screenshot', async ({ page }) => {
    await page.route('**/api/dashboard', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' }),
      });
    });

    await page.reload();
    await expect(page.locator('main')).toHaveScreenshot('dashboard-error.png');
  });

  test('should match dashboard with search results screenshot', async ({ page }) => {
    await page.getByPlaceholder(/Search/i).fill('payment');
    await expect(page.locator('main')).toHaveScreenshot('dashboard-search.png');
  });

  test('should match dashboard with filters screenshot', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter' }).click();
    await expect(page.locator('main')).toHaveScreenshot('dashboard-filters.png');
  });
});
