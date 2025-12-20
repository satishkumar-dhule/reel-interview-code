import { test, expect } from '@playwright/test';

/**
 * Onboarding Flow Tests
 * Tests for the first-time user experience
 */

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('marvel-intro-seen', 'true');
    });
    await page.reload();
  });

  test('shows onboarding for first-time users', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome to Learn_Reels')).toBeVisible();
    await expect(page.getByText('Select your role')).toBeVisible();
  });

  test('displays all role options', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Frontend Engineer')).toBeVisible();
    await expect(page.getByText('Backend Engineer')).toBeVisible();
    await expect(page.getByText('Full Stack Engineer')).toBeVisible();
    await expect(page.getByText('DevOps Engineer')).toBeVisible();
  });

  test('allows selecting a role', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Frontend Engineer').click();
    await expect(page.getByText('Selected')).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Your Personalized Channels')).toBeVisible();
  });

  test('completes onboarding flow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome to Learn_Reels')).toBeVisible();
    
    await page.getByText('Backend Engineer').click();
    await expect(page.getByText('Selected')).toBeVisible();
    
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Your Personalized Channels')).toBeVisible({ timeout: 10000 });
    
    await page.getByRole('button', { name: /start learning/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    await page.waitForTimeout(1000);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent && pageContent.length > 100).toBeTruthy();
  });

  test('allows skipping onboarding', async ({ page }) => {
    await page.goto('/');
    const skipButton = page.getByText('Skip for now').or(page.getByText('Skip'));
    await skipButton.click();
    
    await page.waitForTimeout(1000);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent && pageContent.length > 100).toBeTruthy();
  });
});
