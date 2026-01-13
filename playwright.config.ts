import { defineConfig, devices } from '@playwright/test';

/**
 * Optimized Playwright Configuration
 * - Parallel execution for speed
 * - Mobile-first testing (iPhone 13)
 * - Performance monitoring
 * - Accessibility testing
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  // Enhanced reporting
  reporter: process.env.CI 
    ? [
        ['line'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [
        ['html', { open: 'on-failure' }],
        ['list'],
      ],
  
  // Optimized timeouts
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    
    // Performance optimizations
    launchOptions: {
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    },
  },
  
  outputDir: 'test-results',
  
  projects: [
    // Desktop Chrome - Primary
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      testIgnore: ['**/mobile-only.spec.ts'],
    },
    
    // iPhone 13 - Mobile Primary Target
    {
      name: 'mobile-iphone13',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
      testMatch: /.*\.(spec|test)\.ts$/,
    },
    
    // iPad - Tablet
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        hasTouch: true,
        isMobile: true,
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      testIgnore: ['**/desktop-only.spec.ts'],
    },
    
    // Firefox - Cross-browser
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      testIgnore: ['**/mobile-only.spec.ts', '**/unified/**'],
    },
    
    // Safari - Cross-browser (macOS only)
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.(spec|test)\.ts$/,
      testIgnore: ['**/mobile-only.spec.ts', '**/unified/**'],
    },
    
    // Accessibility Testing
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.a11y\.spec\.ts$/,
    },
    
    // Performance Testing
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.perf\.spec\.ts$/,
    },
  ],
  
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Global setup/teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
});
