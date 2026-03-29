import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Hide any dynamic elements that might cause test flakiness
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('homepage layout', async ({ page }) => {
    await page.goto('/');
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png');
  });

  test('navigation component', async ({ page }) => {
    await page.goto('/');
    
    // Focus on navigation area
    const nav = page.locator('nav, header, [role="navigation"]').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('navigation.png');
    }
  });

  test('login form', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for login form to be visible
    await page.waitForSelector('form, [data-testid="login-form"], .login-form');
    
    // Take screenshot of login form
    const loginForm = page.locator('form, [data-testid="login-form"], .login-form').first();
    await expect(loginForm).toHaveScreenshot('login-form.png');
  });

  test('registration form', async ({ page }) => {
    await page.goto('/register');
    
    // Wait for registration form to be visible
    await page.waitForSelector('form, [data-testid="register-form"], .register-form');
    
    // Take screenshot of registration form
    const registerForm = page.locator('form, [data-testid="register-form"], .register-form').first();
    await expect(registerForm).toHaveScreenshot('register-form.png');
  });

  test('dashboard layout', async ({ page }) => {
    // Mock authentication for dashboard access
    await page.addInitScript(() => {
      window.localStorage.setItem('authToken', 'mock-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });

    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, main');
    
    // Take screenshot of dashboard
    const dashboard = page.locator('[data-testid="dashboard"], .dashboard, main').first();
    if (await dashboard.isVisible()) {
      await expect(dashboard).toHaveScreenshot('dashboard.png');
    }
  });

  test('user profile form', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('authToken', 'mock-token');
      window.localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });

    await page.goto('/profile');
    
    // Wait for profile form to be visible
    await page.waitForSelector('form, [data-testid="profile-form"], .profile-form');
    
    // Take screenshot of profile form
    const profileForm = page.locator('form, [data-testid="profile-form"], .profile-form').first();
    if (await profileForm.isVisible()) {
      await expect(profileForm).toHaveScreenshot('profile-form.png');
    }
  });

  test('responsive design - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('responsive design - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Take tablet screenshot
    await expect(page).toHaveScreenshot('homepage-tablet.png');
  });

  test('error states', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form to trigger validation errors
    const submitButton = page.locator('button[type="submit"], .submit-btn').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for error messages to appear
      await page.waitForTimeout(1000);
      
      // Take screenshot of error state
      await expect(page).toHaveScreenshot('login-validation-errors.png');
    }
  });

  test('loading states', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/**', route => {
      // Delay response to show loading state
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/dashboard');
    
    // Take screenshot of loading state
    await expect(page).toHaveScreenshot('dashboard-loading.png');
  });

  test('dark mode layout', async ({ page }) => {
    // Enable dark mode if available
    await page.goto('/');
    
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], .dark-mode-toggle, .theme-toggle').first();
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // Take screenshot in dark mode
      await expect(page).toHaveScreenshot('homepage-dark-mode.png');
    }
  });

  test('component hover states', async ({ page }) => {
    await page.goto('/');
    
    // Find interactive elements
    const buttons = page.locator('button, .btn, [role="button"]');
    const count = await buttons.count();
    
    if (count > 0) {
      // Hover over first button
      await buttons.first().hover();
      await page.waitForTimeout(200);
      
      // Take screenshot of hover state
      await expect(page.locator('body')).toHaveScreenshot('button-hover-state.png');
    }
  });

  test('form focus states', async ({ page }) => {
    await page.goto('/login');
    
    // Find first input field
    const firstInput = page.locator('input, textarea, select').first();
    if (await firstInput.isVisible()) {
      await firstInput.focus();
      await page.waitForTimeout(200);
      
      // Take screenshot of focus state
      await expect(page.locator('body')).toHaveScreenshot('input-focus-state.png');
    }
  });
});
