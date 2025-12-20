import { test, expect } from '@playwright/test';

/**
 * Static Pages Tests
 * Tests for About, What's New, and other static pages
 */

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('displays heading', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/about');
    await page.waitForTimeout(1000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe("What's New Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('displays heading', async ({ page }) => {
    await page.goto('/whats-new');
    await expect(page.getByText("What's New")).toBeVisible();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/whats-new');
    await page.waitForTimeout(1000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe('Stats Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem('progress-system-design', JSON.stringify(['sd-1', 'sd-2', 'sd-3']));
    });
  });

  test('displays stats content', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForTimeout(1500);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});
