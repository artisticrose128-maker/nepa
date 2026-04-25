import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {

    test('Dashboard matches snapshot', async ({ page }) => {
        await page.goto('/dashboard');
        // Wait for essential elements to load
        await expect(page.locator('h1')).toBeVisible();
        await page.waitForLoadState('networkidle');
        
        // Take a screenshot and compare with baseline
        await expect(page).toHaveScreenshot('dashboard.png');
    });

    test('Auth Page matches snapshot', async ({ page }) => {
        await page.goto('/auth');
        await expect(page.locator('form')).toBeVisible();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('auth-page.png');
    });

    test('Offline Page matches snapshot', async ({ page }) => {
        await page.goto('/offline');
        await expect(page.locator('.offline-container')).toBeVisible();
        await expect(page).toHaveScreenshot('offline-page.png');
    });

    test('Mobile Dashboard matches snapshot', async ({ page }) => {
        // Test responsiveness across devices
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('mobile-dashboard.png');
    });
});
