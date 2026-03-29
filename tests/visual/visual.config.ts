import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/screenshots/{testName}-{projectName}{ext}',
  expect: {
    // Screenshot comparison options
    threshold: 0.2, // Allow 20% pixel difference
    animateStickers: false, // Disable animations for consistent screenshots
  },
  use: {
    // Screenshot options
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Viewport options for consistent screenshots
    viewport: { width: 1280, height: 720 },
    
    // Ignore specific elements that might change (timestamps, etc.)
    ignoreHTTPSErrors: true,
    
    // Color scheme for consistent screenshots
    colorScheme: 'light',
    
    // Locale for consistent text rendering
    locale: 'en-US',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
