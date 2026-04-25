import { Page, Locator } from '@playwright/test';

export class VisualHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for all images to be loaded
   */
  async waitForImages(): Promise<void> {
    const images = await this.page.locator('img').all();
    await Promise.all(
      images.map(img => img.waitForElementState('stable'))
    );
  }

  /**
   * Hide dynamic elements that might cause test flakiness
   */
  async hideDynamicElements(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        /* Hide dynamic timestamps */
        .timestamp, [data-timestamp], time {
          visibility: hidden !important;
        }
        
        /* Hide loading spinners */
        .loading, .spinner, [data-loading] {
          display: none !important;
        }
        
        /* Disable animations */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        /* Hide dynamic content */
        .dynamic, [data-dynamic] {
          visibility: hidden !important;
        }
        
        /* Fix carousel positions */
        .carousel, .slider {
          overflow: hidden !important;
        }
      `
    });
  }

  /**
   * Mock user data for consistent UI
   */
  async mockUserData(userData: any = {}): Promise<void> {
    const defaultUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      avatar: 'https://picsum.photos/seed/testuser/100/100.jpg',
      ...userData
    };

    await this.page.addInitScript((user) => {
      window.localStorage.setItem('authToken', 'mock-jwt-token');
      window.localStorage.setItem('user', JSON.stringify(user));
      window.localStorage.setItem('isAuthenticated', 'true');
    }, defaultUser);
  }

  /**
   * Mock API responses for consistent data
   */
  async mockApiResponses(): Promise<void> {
    // Mock user profile API
    await this.page.route('**/api/user/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          avatar: 'https://picsum.photos/seed/testuser/100/100.jpg',
          preferences: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        })
      });
    });

    // Mock dashboard data API
    await this.page.route('**/api/analytics/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 1234,
          activeUsers: 567,
          totalTransactions: 8901,
          revenue: 12345.67,
          chartData: [
            { month: 'Jan', value: 100 },
            { month: 'Feb', value: 150 },
            { month: 'Mar', value: 120 }
          ]
        })
      });
    });

    // Mock payment history API
    await this.page.route('**/api/payment/history', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'payment-1',
            amount: 99.99,
            currency: 'USD',
            status: 'completed',
            date: '2024-01-15T10:00:00Z',
            description: 'Test Payment'
          },
          {
            id: 'payment-2',
            amount: 49.99,
            currency: 'USD',
            status: 'pending',
            date: '2024-01-14T15:30:00Z',
            description: 'Another Payment'
          }
        ])
      });
    });
  }

  /**
   * Take a screenshot with consistent settings
   */
  async takeScreenshot(name: string, locator?: Locator): Promise<void> {
    await this.hideDynamicElements();
    await this.waitForImages();
    
    if (locator) {
      await locator.screenshot({
        path: `screenshots/${name}.png`,
        fullPage: false,
        animations: 'disabled'
      });
    } else {
      await this.page.screenshot({
        path: `screenshots/${name}.png`,
        fullPage: true,
        animations: 'disabled'
      });
    }
  }

  /**
   * Set viewport and take screenshots for multiple screen sizes
   */
  async takeResponsiveScreenshots(baseName: string): Promise<void> {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },   // iPhone
      { width: 768, height: 1024, name: 'tablet' },  // iPad
      { width: 1280, height: 720, name: 'desktop' }, // Desktop
      { width: 1920, height: 1080, name: 'large' }  // Large desktop
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot(`${baseName}-${viewport.name}`);
    }
  }

  /**
   * Test component在不同主题下的表现
   */
  async testThemeVariations(baseName: string, componentLocator: Locator): Promise<void> {
    // Test light theme
    await this.page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${baseName}-light`, componentLocator);

    // Test dark theme
    await this.page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(`${baseName}-dark`, componentLocator);
  }

  /**
   * Test component在不同状态下的表现
   */
  async testComponentStates(baseName: string, componentLocator: Locator): Promise<void> {
    // Normal state
    await this.takeScreenshot(`${baseName}-normal`, componentLocator);

    // Hover state
    await componentLocator.hover();
    await this.page.waitForTimeout(200);
    await this.takeScreenshot(`${baseName}-hover`, componentLocator);

    // Focus state (if it's an input)
    const tagName = await componentLocator.evaluate(el => el.tagName.toLowerCase());
    if (['input', 'textarea', 'select', 'button'].includes(tagName)) {
      await componentLocator.focus();
      await this.page.waitForTimeout(200);
      await this.takeScreenshot(`${baseName}-focus`, componentLocator);
    }

    // Active/pressed state
    await componentLocator.click();
    await this.page.waitForTimeout(200);
    await this.takeScreenshot(`${baseName}-active`, componentLocator);
  }

  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    // Clear localStorage
    await this.page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // Clear any mocked routes
    await this.page.unroute('**/api/**');
  }
}
