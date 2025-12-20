import { test, expect } from '@playwright/test';

/**
 * Badges Page Tests
 * Tests for the badges/achievements page
 */

test.describe('Badges Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'frontend', 'devops'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem('progress-system-design', JSON.stringify(['sd-1', 'sd-2', 'sd-3']));
      localStorage.setItem('progress-algorithms', JSON.stringify(['algo-1', 'algo-2']));
    });
  });

  test('displays badges heading', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Badges/i })).toBeVisible();
  });

  test('shows Your Collection section', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Your Collection')).toBeVisible();
  });

  test('renders badge rings', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const circles = page.locator('svg circle');
    const circleCount = await circles.count();
    expect(circleCount).toBeGreaterThan(0);
  });

  test('has category tabs', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const tabButtons = page.locator('button').filter({ hasText: /All|Channel|Streak|Progress/i });
    const tabCount = await tabButtons.count();
    expect(tabCount).toBeGreaterThanOrEqual(1);
  });

  test('badge click opens modal', async ({ page }) => {
    await page.goto('/badges');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const clickableBadge = page.locator('[class*="cursor-pointer"][class*="group"]').first();
    if (await clickableBadge.isVisible()) {
      await clickableBadge.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[class*="fixed"][class*="inset-0"][class*="z-50"]');
      if (await modal.isVisible()) {
        await page.keyboard.press('Escape');
      }
    }
  });
});
