import { test, expect } from '@playwright/test';

/**
 * Visual Verification: Search Boxes
 * Takes screenshots to prove search boxes are visible
 */

test.describe('Visual Verification - Search Boxes', () => {
  test('Learning Paths - search box screenshot', async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
    
    // Wait for search box
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await expect(searchInput).toBeVisible();
    
    // Take screenshot of the header area
    const header = page.locator('text=Learning Paths').locator('..').locator('..');
    await header.screenshot({ path: 'test-results/learning-paths-search-box.png' });
    
    console.log('✅ Screenshot saved: test-results/learning-paths-search-box.png');
  });

  test('Channels - search box screenshot', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    // Wait for search box
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();
    
    // Take screenshot of the header area
    await page.screenshot({ 
      path: 'test-results/channels-search-box.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });
    
    console.log('✅ Screenshot saved: test-results/channels-search-box.png');
  });

  test('Mobile - search box screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    // Wait for search box
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-search-box.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 300 }
    });
    
    console.log('✅ Screenshot saved: test-results/mobile-search-box.png');
  });

  test('Learning Paths - with search query', async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await searchInput.fill('Google');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/learning-paths-search-active.png',
      fullPage: true
    });
    
    console.log('✅ Screenshot saved: test-results/learning-paths-search-active.png');
  });

  test('Channels - with search query', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await searchInput.fill('React');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/channels-search-active.png',
      fullPage: true
    });
    
    console.log('✅ Screenshot saved: test-results/channels-search-active.png');
  });
});
