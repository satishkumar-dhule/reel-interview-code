import { test, expect, Page } from '@playwright/test';

/**
 * Core Mobile Tests
 * Tests fundamental mobile functionality: responsiveness, navigation, touch interactions
 */

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('marvel-intro-seen', 'true');
    localStorage.setItem('user-preferences', JSON.stringify({
      role: 'fullstack',
      subscribedChannels: ['system-design', 'algorithms', 'backend', 'frontend', 'devops', 'sre'],
      onboardingComplete: true,
      createdAt: new Date().toISOString()
    }));
  });
}

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('home page has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('channel page has no horizontal overflow', async ({ page }) => {
    await page.goto('/channel/system-design');
    await page.waitForTimeout(2000);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('stats page has no horizontal overflow', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForTimeout(1500);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('badges page has no horizontal overflow', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForTimeout(1500);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('bottom navigation is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const bottomNav = page.locator('nav').filter({ has: page.locator('text=Home') });
    await expect(bottomNav).toBeVisible({ timeout: 5000 });
  });

  test('ESC key navigates to home from channel', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/');
  });

  test('back button works on channel page', async ({ page }) => {
    await page.goto('/channel/system-design');
    await page.waitForTimeout(2000);
    const backButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).first();
    await backButton.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Mobile Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('touch targets are large enough', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const buttons = await page.locator('button').all();
    for (const button of buttons.slice(0, 10)) {
      const box = await button.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        expect(box.width).toBeGreaterThanOrEqual(30);
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('channel card tap navigates to channel', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const channelCard = page.locator('[class*="cursor-pointer"][class*="border"][class*="p-3"]').first();
    if (await channelCard.isVisible()) {
      await channelCard.tap();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/channel/');
    }
  });
});

test.describe('Mobile Onboarding', () => {
  test('onboarding displays on first visit', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('user-preferences');
      localStorage.setItem('marvel-intro-seen', 'true');
    });
    await page.goto('/');
    await expect(page.getByText(/Welcome|Get Started|Choose/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('role selection works', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('user-preferences');
      localStorage.setItem('marvel-intro-seen', 'true');
    });
    await page.goto('/');
    const roleButtons = page.locator('button').filter({ hasText: /Frontend|Backend|Fullstack|DevOps/i });
    const count = await roleButtons.count();
    expect(count).toBeGreaterThan(0);
    await roleButtons.first().click();
    await page.waitForTimeout(300);
  });
});
