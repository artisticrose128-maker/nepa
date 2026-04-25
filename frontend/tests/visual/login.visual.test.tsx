import { test, expect } from '@playwright/test';

test.describe('Login Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should match login form screenshot', async ({ page }) => {
    await expect(page.locator('form')).toHaveScreenshot('login-form.png');
  });

  test('should match login form with errors screenshot', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('form')).toHaveScreenshot('login-form-errors.png');
  });

  test('should match login form with filled data screenshot', async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('password123');
    await expect(page.locator('form')).toHaveScreenshot('login-form-filled.png');
  });

  test('should match two-factor form screenshot', async ({ page }) => {
    // Mock 2FA requirement
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requiresTwoFactor: true }),
      });
    });

    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.locator('form')).toHaveScreenshot('login-form-2fa.png');
  });

  test('should match loading state screenshot', async ({ page }) => {
    // Mock slow login
    await page.route('**/api/auth/login', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }, 2000);
    });

    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.locator('form')).toHaveScreenshot('login-form-loading.png');
  });

  test('should match registration form screenshot', async ({ page }) => {
    await page.getByText('Sign up').click();
    await expect(page.locator('form')).toHaveScreenshot('registration-form.png');
  });

  test('should match wallet connection screenshot', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toHaveScreenshot('wallet-button.png');
  });

  test('should match mobile view screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toHaveScreenshot('login-mobile.png');
  });

  test('should match tablet view screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('main')).toHaveScreenshot('login-tablet.png');
  });

  test('should match dark mode screenshot', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('main')).toHaveScreenshot('login-dark.png');
  });

  test('should match high contrast mode screenshot', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('main')).toHaveScreenshot('login-high-contrast.png');
  });
});
