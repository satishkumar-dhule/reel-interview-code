/**
 * Coding Challenges Gen Z E2E Tests
 * Tests the redesigned coding challenges page
 */

import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

test.describe('Coding Challenges Gen Z', () => {
  test('should load coding challenges list page', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    
    // Check for main heading
    await expect(page.locator('text=CODING CHALLENGES')).toBeVisible();
  });

  test('should display stats grid', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Check for stats cards
    await expect(page.locator('text=Solved').first()).toBeVisible();
    await expect(page.locator('text=Attempts').first()).toBeVisible();
    await expect(page.locator('text=Total Challenges').first()).toBeVisible();
    await expect(page.locator('text=Credits').first()).toBeVisible();
  });

  test('should display quick start buttons', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Check for quick start buttons
    await expect(page.locator('text=Random Challenge')).toBeVisible();
    await expect(page.locator('text=Easy Mode')).toBeVisible();
    await expect(page.locator('text=Medium Mode')).toBeVisible();
  });

  test('should display challenge list', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Wait for challenges to load
    await page.waitForTimeout(2000);
    
    // Check for "ALL CHALLENGES" heading
    await expect(page.locator('text=ALL CHALLENGES')).toBeVisible();
  });

  test('should start a random challenge', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Click random challenge button
    const randomBtn = page.locator('button:has-text("Random Challenge")');
    await randomBtn.click();
    await page.waitForTimeout(1000);
    
    // Should navigate to a challenge
    await expect(page).toHaveURL(/\/coding\/.+/);
  });

  test('should start an easy challenge', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Click easy mode button
    const easyBtn = page.locator('button:has-text("Easy Mode")');
    await easyBtn.click();
    await page.waitForTimeout(1000);
    
    // Should navigate to a challenge
    await expect(page).toHaveURL(/\/coding\/.+/);
  });

  test('should navigate to specific challenge', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    
    // Click first challenge in list
    const firstChallenge = page.locator('button').filter({ hasText: /two sum|reverse string|palindrome/i }).first();
    if (await firstChallenge.count() > 0) {
      await firstChallenge.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to challenge
      await expect(page).toHaveURL(/\/coding\/.+/);
    }
  });

  test('should display challenge view components', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Start a challenge
    const randomBtn = page.locator('button:has-text("Random Challenge")');
    await randomBtn.click();
    await page.waitForTimeout(2000);
    
    // Check for challenge components
    await expect(page.locator('text=Problem').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Examples').first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch programming language', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Start a challenge
    const randomBtn = page.locator('button:has-text("Random Challenge")');
    await randomBtn.click();
    await page.waitForTimeout(2000);
    
    // Find language selector
    const languageSelect = page.locator('select').first();
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption('python');
      await page.waitForTimeout(500);
      
      // Verify Python is selected
      await expect(languageSelect).toHaveValue('python');
    }
  });

  test('should show hints when clicked', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Start a challenge
    const randomBtn = page.locator('button:has-text("Random Challenge")');
    await randomBtn.click();
    await page.waitForTimeout(2000);
    
    // Click show hints button
    const hintsBtn = page.locator('button').filter({ hasText: /show hints/i }).first();
    if (await hintsBtn.count() > 0) {
      await hintsBtn.click();
      await page.waitForTimeout(500);
      
      // Should show hint
      await expect(page.locator('text=Hint').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate back to list', async ({ page }) => {
    await page.goto('/coding');
    await waitForPageLoad(page);
    
    // Start a challenge
    const randomBtn = page.locator('button:has-text("Random Challenge")');
    await randomBtn.click();
    await page.waitForTimeout(3000);
    
    // Verify we're on a challenge page
    await expect(page).toHaveURL(/\/coding\/.+/);
    
    // Wait for challenge view to load
    await page.waitForSelector('text=Problem', { timeout: 10000 });
    
    // Click back button - it's the first button in the page (top-left corner)
    const backBtn = page.locator('button').first();
    await backBtn.click();
    await page.waitForTimeout(1000);
    
    // Should be back on coding list page
    await expect(page).toHaveURL('/coding');
  });
});
