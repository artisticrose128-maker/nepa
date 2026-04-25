import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In to NEPA' })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('should toggle between login and register modes', async ({ page }) => {
    // Click sign up link
    await page.getByText('Sign up').click();
    
    // Should show registration form
    await expect(page.getByRole('heading', { name: /Create your NEPA account/i })).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    
    // Click sign in link
    await page.getByText('Sign in').click();
    
    // Should show login form again
    await expect(page.getByRole('heading', { name: 'Sign In to NEPA' })).toBeVisible();
  });

  test('should handle wallet connection', async ({ page }) => {
    // Mock wallet connection
    await page.addInitScript(() => {
      window.stellar = {
        getPublicKey: async () => 'GD1234567890abcdef',
        signTransaction: async () => 'signed_transaction',
      };
    });

    await page.getByRole('button', { name: 'Connect Wallet' }).click();
    
    // Should attempt to connect wallet
    await expect(page.getByText('Connecting...')).toBeVisible();
  });

  test('should handle two-factor authentication', async ({ page }) => {
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
    
    // Should show 2FA input
    await expect(page.getByLabel(/Two-Factor Code/i)).toBeVisible();
    await expect(page.getByText(/Two-factor authentication required/i)).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Mock failed login
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid credentials' }),
      });
    });

    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', (route) => {
      route.abort('failed');
    });

    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('An unexpected error occurred')).toBeVisible();
  });

  test('should maintain form state during validation errors', async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Form values should be preserved
    await expect(page.getByLabel(/Email Address/i)).toHaveValue('test@example.com');
    await expect(page.getByLabel(/Password/i)).toHaveValue('password123');
  });

  test('should clear error when user starts typing', async ({ page }) => {
    // Mock failed login first
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid credentials' }),
      });
    });

    await page.getByLabel(/Email Address/i).fill('wrong@example.com');
    await page.getByLabel(/Password/i).fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Start typing in email field
    await page.getByLabel(/Email Address/i).fill('correct@example.com');
    
    // Error should be cleared
    await expect(page.getByText('Invalid credentials')).not.toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/Email Address/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/Password/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
    
    await page.keyboard.press('Enter');
    // Should trigger form submission
    await expect(page.getByText(/Email is required/i)).toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('form')).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toHaveAttribute('type', 'email');
    await expect(page.getByLabel(/Password/i)).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: 'Sign In' })).toHaveAttribute('type', 'submit');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Sign In to NEPA' })).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Sign In to NEPA' })).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('heading', { name: 'Sign In to NEPA' })).toBeVisible();
  });
});
