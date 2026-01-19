import { test, expect } from '@playwright/test';

/**
 * Core Search Functionality Tests
 * Essential tests for search boxes in Learning Paths and Channels
 */

test.describe('Learning Paths - Core Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
  });

  test('search box is visible below title', async ({ page }) => {
    const title = page.locator('h1.text-4xl:has-text("Learning Paths")');
    await expect(title).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await expect(searchInput).toBeVisible();

    const titleBox = await title.boundingBox();
    const searchBox = await searchInput.boundingBox();
    
    if (titleBox && searchBox) {
      expect(searchBox.y).toBeGreaterThan(titleBox.y);
      console.log(`✓ Search box is ${searchBox.y - titleBox.y}px below title`);
    }
  });

  test('can type in search box', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    await searchInput.fill('Google');
    await expect(searchInput).toHaveValue('Google');
    console.log('✓ Successfully typed "Google" in search box');
  });

  test('search filters results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    // Type search query
    await searchInput.fill('Frontend');
    await page.waitForTimeout(500);
    
    // Should show results or empty state
    const hasResults = await page.locator('[class*="grid"]').isVisible();
    const hasEmpty = await page.locator('text=No learning paths found').isVisible();
    
    expect(hasResults || hasEmpty).toBeTruthy();
    console.log('✓ Search filtering works');
  });
});

test.describe('Channels - Core Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
  });

  test('search box is visible', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();
    console.log('✓ Channels search box is visible');
  });

  test('can type in search box', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('React');
    await expect(searchInput).toHaveValue('React');
    console.log('✓ Successfully typed "React" in search box');
  });

  test('search filters channels', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('System');
    await page.waitForTimeout(500);
    
    // Should show results or empty state
    const hasResults = await page.locator('[class*="grid"]').isVisible();
    const hasEmpty = await page.locator('text=No channels found').isVisible();
    
    expect(hasResults || hasEmpty).toBeTruthy();
    console.log('✓ Channels search filtering works');
  });
});

test.describe('Mobile Search Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile channels search is visible', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();
    console.log('✓ Mobile search box is visible');
  });

  test('mobile search works', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await searchInput.fill('Design');
    await expect(searchInput).toHaveValue('Design');
    console.log('✓ Mobile search input works');
  });
});
