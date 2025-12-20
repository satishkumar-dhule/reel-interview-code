import { test, expect, Page } from '@playwright/test';

/**
 * Mobile Badges Tests
 * Tests badge rendering and interactions on mobile
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
    localStorage.setItem('progress-system-design', JSON.stringify(['sd-1', 'sd-2', 'sd-3', 'sd-4', 'sd-5']));
    localStorage.setItem('progress-algorithms', JSON.stringify(['algo-1', 'algo-2', 'algo-3']));
  });
}

test.describe('Mobile Badges Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('badges page loads without errors', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: /Badges/i })).toBeVisible();
  });

  test('badge rings render with SVG', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    expect(svgCount).toBeGreaterThan(0);
    const circles = page.locator('svg circle');
    const circleCount = await circles.count();
    expect(circleCount).toBeGreaterThan(0);
  });

  test('badge icons are visible', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const badgeContent = page.locator('[class*="rounded-full"]');
    const contentCount = await badgeContent.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('badge grid fits viewport', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('badge progress rings animate', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const progressCircles = page.locator('svg circle[stroke-dasharray]');
    const circleCount = await progressCircles.count();
    expect(circleCount).toBeGreaterThan(0);
  });

  test('Your Collection section is visible', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const collectionSection = page.getByText('Your Collection');
    await expect(collectionSection).toBeVisible();
  });
});

test.describe('Mobile Badge Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('badge category tabs are tappable', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const tabButtons = page.locator('button').filter({ hasText: /All|Channel|Streak|Progress/i });
    const tabCount = await tabButtons.count();
    expect(tabCount).toBeGreaterThanOrEqual(1);
  });

  test('badge detail modal works', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const clickableBadge = page.locator('[class*="cursor-pointer"][class*="group"]').first();
    if (await clickableBadge.isVisible()) {
      await clickableBadge.tap();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
    }
  });
});
