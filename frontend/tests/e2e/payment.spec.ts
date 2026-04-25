import { test, expect } from '@playwright/test';

test.describe('Payment Flow E2E Tests', () => {
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
    
    await page.goto('/dashboard');
  });

  test('should display payment form', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await expect(page.getByRole('heading', { name: /Pay Your Bill/i })).toBeVisible();
    await expect(page.getByLabel(/Meter Number/i)).toBeVisible();
    await expect(page.getByLabel(/Amount \(NGN\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay Now' })).toBeVisible();
  });

  test('should validate meter number format', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    const meterInput = page.getByLabel(/Meter Number/i);
    await meterInput.fill('INVALID');
    await meterInput.blur();
    
    await expect(page.getByText(/Meter number must follow the format/i)).toBeVisible();
  });

  test('should validate amount limits', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    const amountInput = page.getByLabel(/Amount \(NGN\)/i);
    await amountInput.fill('50');
    await amountInput.blur();
    
    await expect(page.getByText(/Minimum amount is ₦100/i)).toBeVisible();
  });

  test('should use quick amount buttons', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByText('₦1000').click();
    
    await expect(page.getByLabel(/Amount \(NGN\)/i)).toHaveValue('1000');
  });

  test('should complete payment flow', async ({ page }) => {
    // Mock successful payment
    await page.route('**/api/payments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'txn_123456',
          amount: 1000,
          meterNumber: 'METER-123'
        }),
      });
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    
    // Should show success state
    await expect(page.getByText(/Payment Successful/i)).toBeVisible();
    await expect(page.getByText(/Transaction ID: txn_123456/i)).toBeVisible();
  });

  test('should handle payment errors', async ({ page }) => {
    // Mock failed payment
    await page.route('**/api/payments', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Insufficient funds'
        }),
      });
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    
    await expect(page.getByText('Insufficient funds')).toBeVisible();
  });

  test('should show loading state during payment', async ({ page }) => {
    // Mock slow payment
    await page.route('**/api/payments', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }, 2000);
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    
    await expect(page.getByRole('button', { name: 'Processing...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Processing...' })).toBeDisabled();
  });

  test('should handle wallet payment', async ({ page }) => {
    // Mock wallet
    await page.addInitScript(() => {
      window.stellar = {
        getPublicKey: async () => 'GD1234567890abcdef',
        signTransaction: async () => 'signed_transaction',
      };
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    
    await page.getByRole('button', { name: /Pay with Wallet/i }).click();
    
    await expect(page.getByText('Connecting to wallet...')).toBeVisible();
  });

  test('should display payment history', async ({ page }) => {
    // Mock payment history
    await page.route('**/api/payments/history', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          payments: [
            {
              id: '1',
              amount: 1000,
              meterNumber: 'METER-123',
              date: '2024-01-15T10:30:00Z',
              status: 'completed'
            },
            {
              id: '2',
              amount: 500,
              meterNumber: 'METER-123',
              date: '2024-01-10T14:20:00Z',
              status: 'completed'
            }
          ]
        }),
      });
    });

    await page.getByRole('button', { name: /Payment History/i }).click();
    
    await expect(page.getByText('Payment History')).toBeVisible();
    await expect(page.getByText('METER-123')).toBeVisible();
    await expect(page.getByText('₦1,000')).toBeVisible();
    await expect(page.getByText('₦500')).toBeVisible();
  });

  test('should filter payment history', async ({ page }) => {
    await page.route('**/api/payments/history', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          payments: []
        }),
      });
    });

    await page.getByRole('button', { name: /Payment History/i }).click();
    
    await page.getByPlaceholder(/Filter by meter number/i).fill('METER-123');
    await page.getByRole('button', { name: 'Filter' }).click();
    
    // Should make filtered request
    await expect(page.getByText('No payments found')).toBeVisible();
  });

  test('should export payment history', async ({ page }) => {
    await page.getByRole('button', { name: /Payment History/i }).click();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('should handle network errors during payment', async ({ page }) => {
    await page.route('**/api/payments', (route) => {
      route.abort('failed');
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    
    await expect(page.getByText(/Network error occurred/i)).toBeVisible();
  });

  test('should be accessible via keyboard', async ({ page }) => {
    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/Meter Number/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/Amount \(NGN\)/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Pay Now' })).toBeFocused();
    
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Meter number is required/i)).toBeVisible();
  });

  test('should show payment receipt', async ({ page }) => {
    await page.route('**/api/payments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'txn_123456',
          amount: 1000,
          meterNumber: 'METER-123',
          date: '2024-01-15T10:30:00Z'
        }),
      });
    });

    await page.getByRole('button', { name: /Pay Bill/i }).click();
    
    await page.getByLabel(/Meter Number/i).fill('METER-123');
    await page.getByLabel(/Amount \(NGN\)/i).fill('1000');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    
    await expect(page.getByText(/Payment Receipt/i)).toBeVisible();
    await expect(page.getByText('METER-123')).toBeVisible();
    await expect(page.getByText('₦1,000')).toBeVisible();
    await expect(page.getByText('txn_123456')).toBeVisible();
    
    // Test receipt download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Receipt' }).click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/receipt.*\.pdf$/);
  });
});
