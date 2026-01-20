/**
 * Learning Paths Gen Z E2E Tests
 */

import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

test.describe('Learning Paths Gen Z', () => {
  test('should load learning paths page', async ({ page }) => {
    await page.goto('/learning-paths');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('should load my path page', async ({ page }) => {
    await page.goto('/my-path');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('should display path options', async ({ page }) => {
    await page.goto('/learning-paths');
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    
    // Should have some content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

test.describe('Tests Page Gen Z', () => {
  test('should load tests page', async ({ page }) => {
    await page.goto('/tests');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('should display test options', async ({ page }) => {
    await page.goto('/tests');
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);
    
    // Should have content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

test.describe('Review Page Gen Z', () => {
  test('should load review page', async ({ page }) => {
    await page.goto('/review');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });
});

test.describe('Bookmarks Page Gen Z', () => {
  test('should load bookmarks page', async ({ page }) => {
    await page.goto('/bookmarks');
    await waitForPageLoad(page);
    
    // Check for Gen Z theme
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });
});
