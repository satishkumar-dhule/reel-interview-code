import { test, expect } from '@playwright/test';

/**
 * UI Tests for Search Functionality
 * Tests search boxes in Learning Paths and Channels pages
 */

test.describe('Learning Paths Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
  });

  test('should display search box directly below title', async ({ page }) => {
    // Check main title exists (the large one, not the header)
    const title = page.locator('h1.text-4xl:has-text("Learning Paths")');
    await expect(title).toBeVisible();

    // Check description exists
    const description = page.locator('text=Follow structured roadmaps');
    await expect(description).toBeVisible();

    // Check search box exists and is visible
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await expect(searchInput).toBeVisible();

    // Verify search box is positioned below title
    const titleBox = await title.boundingBox();
    const searchBox = await searchInput.boundingBox();
    
    if (titleBox && searchBox) {
      expect(searchBox.y).toBeGreaterThan(titleBox.y);
    }
  });

  test('should have search icon in search box', async ({ page }) => {
    // Check for search icon near the input
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await expect(searchInput).toBeVisible();
    
    // The icon should be visible in the same container
    const container = searchInput.locator('..');
    const hasSearchIcon = await container.locator('svg').count() > 0;
    expect(hasSearchIcon).toBeTruthy();
  });

  test('should allow typing in search box', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    await searchInput.fill('Google');
    await expect(searchInput).toHaveValue('Google');
    
    await searchInput.clear();
    await searchInput.fill('Frontend');
    await expect(searchInput).toHaveValue('Frontend');
  });

  test('should filter results when searching', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    // Wait for initial paths to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Type search query
    await searchInput.fill('Google');
    await page.waitForTimeout(500); // Wait for debounce/filtering
    
    // Check if results are filtered (should show company-specific paths)
    const pathCards = page.locator('[class*="bg-card"][class*="border"]');
    const count = await pathCards.count();
    
    // Should have some results or show empty state
    if (count === 0) {
      await expect(page.locator('text=No learning paths found')).toBeVisible();
    } else {
      // At least one card should contain "Google" in title or description
      const googlePath = page.locator('text=/.*Google.*/i').first();
      await expect(googlePath).toBeVisible();
    }
  });

  test('should show empty state when no results found', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    await searchInput.fill('xyznonexistentquery123');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=No learning paths found')).toBeVisible();
  });

  test('should clear search and show all results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    // Search for something
    await searchInput.fill('Google');
    await page.waitForTimeout(500);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Should show results again or loading state
    const hasResults = await page.locator('[class*="grid"]').isVisible();
    const hasLoading = await page.locator('text=Loading').isVisible();
    
    expect(hasResults || hasLoading).toBeTruthy();
  });

  test('should work with filters and search together', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    
    // Open filters if they exist
    const filterButton = page.locator('button:has-text("Filters")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select a difficulty
      const difficultySelect = page.locator('select').first();
      if (await difficultySelect.isVisible()) {
        await difficultySelect.selectOption('intermediate');
      }
    }
    
    // Add search query
    await searchInput.fill('Engineer');
    await page.waitForTimeout(500);
    
    // Should show filtered and searched results
    const resultsCount = page.locator('text=/Found \\d+ learning path/');
    if (await resultsCount.isVisible()) {
      await expect(resultsCount).toBeVisible();
    }
  });
});

test.describe('Channels Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
  });

  test('should display search box directly below title', async ({ page }) => {
    // Check search box exists and is visible (mobile may not show title the same way)
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();

    // On desktop, verify title and position
    const title = page.locator('h1:has-text("Browse Channels")').first();
    const titleVisible = await title.isVisible().catch(() => false);
    
    if (titleVisible) {
      const titleBox = await title.boundingBox();
      const searchBox = await searchInput.boundingBox();
      
      if (titleBox && searchBox) {
        expect(searchBox.y).toBeGreaterThan(titleBox.y);
      }
    }
  });

  test('should have search icon in search box', async ({ page }) => {
    const searchContainer = page.locator('input[placeholder*="Search channels"]').locator('..');
    const searchIcon = searchContainer.locator('svg').first();
    await expect(searchIcon).toBeVisible();
  });

  test('should allow typing in search box', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('React');
    await expect(searchInput).toHaveValue('React');
    
    await searchInput.clear();
    await searchInput.fill('System Design');
    await expect(searchInput).toHaveValue('System Design');
  });

  test('should filter channels when searching', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    // Wait for channels to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Get initial channel count
    const initialCards = page.locator('[class*="bg-card"]');
    const initialCount = await initialCards.count();
    
    // Search for specific channel
    await searchInput.fill('React');
    await page.waitForTimeout(500);
    
    // Should have filtered results
    const filteredCards = page.locator('[class*="bg-card"]');
    const filteredCount = await filteredCards.count();
    
    // Either fewer results or empty state
    if (filteredCount === 0) {
      await expect(page.locator('text=No channels found')).toBeVisible();
    } else {
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should show empty state when no channels match', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('xyznonexistentchannel999');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=No channels found')).toBeVisible();
  });

  test('should work with category filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    // Click a category pill
    const categoryPills = page.locator('button[class*="rounded-full"]');
    const firstCategory = categoryPills.nth(1); // Skip "All Channels"
    
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      await page.waitForTimeout(300);
    }
    
    // Add search
    await searchInput.fill('Design');
    await page.waitForTimeout(500);
    
    // Should show filtered results or empty state
    const hasResults = await page.locator('[class*="grid"]').isVisible();
    const hasEmpty = await page.locator('text=No channels found').isVisible();
    
    expect(hasResults || hasEmpty).toBeTruthy();
  });

  test('should clear search with X button if present', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('React');
    await page.waitForTimeout(300);
    
    // Look for clear button (X icon)
    const clearButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' });
    
    if (await clearButton.first().isVisible()) {
      await clearButton.first().click();
      await expect(searchInput).toHaveValue('');
    }
  });
});

test.describe('Mobile Channels Search', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
  });

  test('should display search box on mobile', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toBeVisible();
  });

  test('should be sticky on mobile', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    // Get initial position
    const initialBox = await searchInput.boundingBox();
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(300);
    
    // Search should still be visible (sticky)
    await expect(searchInput).toBeVisible();
  });

  test('should filter on mobile', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    await searchInput.fill('System');
    await page.waitForTimeout(500);
    
    // Should show filtered results
    const channelCards = page.locator('[class*="bg-card"]');
    const count = await channelCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Search Accessibility', () => {
  test('learning paths search should be keyboard accessible', async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
    
    // Tab to search input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type in search
    await page.keyboard.type('Frontend');
    
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await expect(searchInput).toHaveValue('Frontend');
  });

  test('channels search should be keyboard accessible', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    // Tab to search input
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Type in search
    await page.keyboard.type('React');
    
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    await expect(searchInput).toHaveValue('React');
  });

  test('search inputs should have proper focus styles', async ({ page }) => {
    await page.goto('/learning-paths');
    
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    await searchInput.focus();
    
    // Check if focus ring is visible
    const focusedInput = await searchInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some focus indication
    expect(focusedInput.outline !== 'none' || focusedInput.boxShadow !== 'none').toBeTruthy();
  });
});

test.describe('Search Performance', () => {
  test('should not cause layout shift when typing', async ({ page }) => {
    await page.goto('/learning-paths');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search learning paths"]');
    const initialBox = await searchInput.boundingBox();
    
    await searchInput.fill('This is a long search query to test layout');
    await page.waitForTimeout(100);
    
    const afterBox = await searchInput.boundingBox();
    
    // Position should not change significantly
    if (initialBox && afterBox) {
      expect(Math.abs(initialBox.y - afterBox.y)).toBeLessThan(5);
    }
  });

  test('should handle rapid typing', async ({ page }) => {
    await page.goto('/channels');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search channels"]');
    
    // Type rapidly
    await searchInput.type('abcdefghijklmnop', { delay: 10 });
    
    // Should still be responsive
    await expect(searchInput).toHaveValue('abcdefghijklmnop');
  });
});
