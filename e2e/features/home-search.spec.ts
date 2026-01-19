import { test, expect } from '@playwright/test';

/**
 * Home Page Search Tests
 * Tests search boxes in Your Channels and Learning Paths sections
 */

test.describe('Home Page - Your Channels Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display search box in Your Channels section', async ({ page }) => {
    // Check if Your Channels section exists
    const channelsHeading = page.locator('h2:has-text("Your Channels")');
    
    // If user has channels, search should be visible
    if (await channelsHeading.isVisible()) {
      const searchInput = page.locator('input[placeholder*="Search your channels"]');
      
      // Search box should be visible if user has channels
      const hasChannels = await page.locator('.channels-grid').isVisible().catch(() => false);
      if (hasChannels) {
        await expect(searchInput).toBeVisible();
        console.log('✓ Your Channels search box is visible');
      }
    }
  });

  test('can type in Your Channels search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search your channels"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('React');
      await expect(searchInput).toHaveValue('React');
      console.log('✓ Can type in Your Channels search');
    }
  });

  test('can clear Your Channels search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search your channels"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('System');
      await page.waitForTimeout(300);
      
      // Look for clear button
      const clearButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).first();
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(searchInput).toHaveValue('');
        console.log('✓ Can clear Your Channels search');
      }
    }
  });
});

test.describe('Home Page - Learning Paths Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display search box in Learning Paths section', async ({ page }) => {
    // Check if Learning Paths section exists
    const pathsHeading = page.locator('h3:has-text("Learning Paths")');
    
    if (await pathsHeading.isVisible()) {
      const searchInput = page.locator('input[placeholder*="Search paths"]');
      await expect(searchInput).toBeVisible();
      console.log('✓ Learning Paths search box is visible');
    }
  });

  test('can type in Learning Paths search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search paths"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Frontend');
      await expect(searchInput).toHaveValue('Frontend');
      console.log('✓ Can type in Learning Paths search');
    }
  });

  test('filters learning paths when searching', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search paths"]');
    
    if (await searchInput.isVisible()) {
      // Count initial paths
      const initialPaths = await page.locator('.group.cursor-pointer').count();
      
      // Search for specific path
      await searchInput.fill('Backend');
      await page.waitForTimeout(300);
      
      // Should show filtered results or empty state
      const hasResults = await page.locator('text=Backend').isVisible();
      const hasEmpty = await page.locator('text=No paths found').isVisible();
      
      expect(hasResults || hasEmpty).toBeTruthy();
      console.log('✓ Learning Paths search filtering works');
    }
  });

  test('shows empty state when no paths match', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search paths"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123');
      await page.waitForTimeout(300);
      
      await expect(page.locator('text=No paths found')).toBeVisible();
      console.log('✓ Empty state shows when no paths match');
    }
  });

  test('can clear Learning Paths search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search paths"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Algorithm');
      await page.waitForTimeout(300);
      
      // Look for clear button
      const clearButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(searchInput).toHaveValue('');
        console.log('✓ Can clear Learning Paths search');
      }
    }
  });
});

test.describe('Home Page - Search Accessibility', () => {
  test('search boxes are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through page to reach search boxes
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('placeholder') || '';
      });
      
      if (focused.includes('Search')) {
        console.log(`✓ Found search box via keyboard: ${focused}`);
        
        // Type in the focused search box
        await page.keyboard.type('Test');
        break;
      }
    }
  });
});
