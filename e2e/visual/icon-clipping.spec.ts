/**
 * E2E Tests: Icon Clipping Prevention
 * Verifies that all icons are properly displayed without clipping
 */

import { test, expect } from '@playwright/test';

test.describe('Icon Clipping Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Quick Actions icons should not be clipped on mobile', async ({ page }) => {
    // Set mobile viewport (iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Wait for Quick Actions section
    await page.waitForSelector('text=Quick Start');
    
    // Check Voice Interview icon specifically
    const voiceButton = page.locator('button:has-text("Voice Interview")');
    await expect(voiceButton).toBeVisible();
    
    // Get the icon container (the colored box)
    const iconContainer = voiceButton.locator('div[class*="rounded-lg"][class*="bg-gradient"]').first();
    const iconContainerBox = await iconContainer.boundingBox();
    
    // Get the actual icon (SVG)
    const icon = iconContainer.locator('svg');
    const iconBox = await icon.boundingBox();
    
    // Verify icon is not clipped
    if (iconContainerBox && iconBox) {
      // Icon should be fully contained within its container with padding
      expect(iconBox.x).toBeGreaterThan(iconContainerBox.x);
      expect(iconBox.y).toBeGreaterThan(iconContainerBox.y);
      expect(iconBox.x + iconBox.width).toBeLessThan(iconContainerBox.x + iconContainerBox.width);
      expect(iconBox.y + iconBox.height).toBeLessThan(iconContainerBox.y + iconContainerBox.height);
      
      // Icon should have at least 8px padding on each side (p-2.5 = 10px)
      const paddingX = (iconContainerBox.width - iconBox.width) / 2;
      const paddingY = (iconContainerBox.height - iconBox.height) / 2;
      expect(paddingX).toBeGreaterThanOrEqual(8);
      expect(paddingY).toBeGreaterThanOrEqual(8);
      
      // Icon should be reasonably sized (20px on mobile)
      expect(iconBox.width).toBeGreaterThanOrEqual(18);
      expect(iconBox.width).toBeLessThanOrEqual(22);
      expect(iconBox.height).toBeGreaterThanOrEqual(18);
      expect(iconBox.height).toBeLessThanOrEqual(22);
    }
    
    // Take screenshot for visual verification
    await voiceButton.screenshot({ path: 'test-results/voice-interview-icon-mobile.png' });
  });

  test('Quick Actions icons should not be clipped on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Wait for Quick Actions section
    await page.waitForSelector('text=Quick Start');
    
    // Check all action buttons
    const actions = ['Voice Interview', 'Coding Challenge', 'Training Mode', 'Quick Tests'];
    
    for (const actionName of actions) {
      const button = page.locator(`button:has-text("${actionName}")`);
      await expect(button).toBeVisible();
      
      // Get the icon container
      const iconContainer = button.locator('div').first();
      const iconContainerBox = await iconContainer.boundingBox();
      
      // Get the actual icon (SVG)
      const icon = iconContainer.locator('svg');
      const iconBox = await icon.boundingBox();
      
      // Verify icon is not clipped
      if (iconContainerBox && iconBox) {
        expect(iconBox.x).toBeGreaterThanOrEqual(iconContainerBox.x);
        expect(iconBox.y).toBeGreaterThanOrEqual(iconContainerBox.y);
        expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(iconContainerBox.x + iconContainerBox.width);
        expect(iconBox.y + iconBox.height).toBeLessThanOrEqual(iconContainerBox.y + iconContainerBox.height);
      }
    }
    
    // Take screenshot for visual verification
    await page.locator('text=Quick Start').screenshot({ path: 'test-results/quick-actions-icons-desktop.png' });
  });

  test('Header icons should not be clipped in ExtremeQuestionViewer', async ({ page }) => {
    // Navigate to a channel
    await page.goto('/extreme/channel/react');
    await page.waitForLoadState('networkidle');
    
    // Check header icons
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Get all icon buttons in header
    const iconButtons = header.locator('button svg');
    const count = await iconButtons.count();
    
    for (let i = 0; i < count; i++) {
      const icon = iconButtons.nth(i);
      const iconBox = await icon.boundingBox();
      
      if (iconBox) {
        // Icon should have reasonable size (not too small)
        expect(iconBox.width).toBeGreaterThanOrEqual(12);
        expect(iconBox.height).toBeGreaterThanOrEqual(12);
        
        // Icon should not be larger than its container
        expect(iconBox.width).toBeLessThanOrEqual(24);
        expect(iconBox.height).toBeLessThanOrEqual(24);
      }
    }
    
    // Take screenshot
    await header.screenshot({ path: 'test-results/extreme-viewer-header-icons.png' });
  });

  test('Navigation footer icons should not be clipped on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Navigate to a channel
    await page.goto('/extreme/channel/react');
    await page.waitForLoadState('networkidle');
    
    // Check footer navigation
    const footer = page.locator('footer, div[class*="bottom"]').last();
    
    // Get all icon buttons in footer
    const iconButtons = footer.locator('button svg');
    const count = await iconButtons.count();
    
    for (let i = 0; i < count; i++) {
      const icon = iconButtons.nth(i);
      const iconBox = await icon.boundingBox();
      
      if (iconBox) {
        // Icon should be visible and properly sized
        expect(iconBox.width).toBeGreaterThanOrEqual(12);
        expect(iconBox.height).toBeGreaterThanOrEqual(12);
      }
    }
    
    // Take screenshot
    await footer.screenshot({ path: 'test-results/navigation-footer-icons-mobile.png' });
  });

  test('Test session header icons should not be clipped', async ({ page }) => {
    // Navigate to test session
    await page.goto('/test/react');
    await page.waitForLoadState('networkidle');
    
    // Start test if on ready screen
    const startButton = page.locator('button:has-text("Start Test")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check header
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Get all icons in header
    const icons = header.locator('svg');
    const count = await icons.count();
    
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      const iconBox = await icon.boundingBox();
      
      if (iconBox) {
        // Icon should be properly sized
        expect(iconBox.width).toBeGreaterThanOrEqual(10);
        expect(iconBox.height).toBeGreaterThanOrEqual(10);
        expect(iconBox.width).toBeLessThanOrEqual(24);
        expect(iconBox.height).toBeLessThanOrEqual(24);
      }
    }
    
    // Take screenshot
    await header.screenshot({ path: 'test-results/test-session-header-icons.png' });
  });

  test('Voice Interview header icons should not be clipped', async ({ page }) => {
    // Navigate to voice interview
    await page.goto('/voice-interview');
    await page.waitForLoadState('networkidle');
    
    // Check header
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check the Mic icon specifically
    const micIcon = header.locator('svg').first();
    const micBox = await micIcon.boundingBox();
    
    if (micBox) {
      // Mic icon should be properly sized
      expect(micBox.width).toBeGreaterThanOrEqual(12);
      expect(micBox.height).toBeGreaterThanOrEqual(12);
      expect(micBox.width).toBeLessThanOrEqual(20);
      expect(micBox.height).toBeLessThanOrEqual(20);
    }
    
    // Take screenshot
    await header.screenshot({ path: 'test-results/voice-interview-header-icons.png' });
  });

  test('Filter dropdown icons should not be clipped', async ({ page }) => {
    // Navigate to a channel
    await page.goto('/extreme/channel/react');
    await page.waitForLoadState('networkidle');
    
    // Open filters
    const filterButton = page.locator('button:has(svg)').filter({ hasText: /settings|filter/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      
      // Check filter panel icons
      const filterPanel = page.locator('[class*="filter"]').first();
      const icons = filterPanel.locator('svg');
      const count = await icons.count();
      
      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const iconBox = await icon.boundingBox();
        
        if (iconBox) {
          // Icon should be properly sized
          expect(iconBox.width).toBeGreaterThanOrEqual(10);
          expect(iconBox.height).toBeGreaterThanOrEqual(10);
        }
      }
      
      // Take screenshot
      await filterPanel.screenshot({ path: 'test-results/filter-dropdown-icons.png' });
    }
  });

  test('All icons should have proper overflow handling', async ({ page }) => {
    // Check multiple pages
    const pages = [
      '/',
      '/extreme/channel/react',
      '/test/react',
      '/voice-interview',
      '/review'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Get all icon containers
      const iconContainers = page.locator('div:has(> svg)');
      const count = await iconContainers.count();
      
      for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20 to avoid timeout
        const container = iconContainers.nth(i);
        
        // Check if container has overflow hidden or visible
        const overflow = await container.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.overflow;
        });
        
        // Container should not have overflow: hidden that clips icons
        // It should be 'visible' or have proper padding
        if (overflow === 'hidden') {
          const padding = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              top: parseInt(style.paddingTop),
              right: parseInt(style.paddingRight),
              bottom: parseInt(style.paddingBottom),
              left: parseInt(style.paddingLeft)
            };
          });
          
          // If overflow is hidden, there should be padding
          const hasPadding = padding.top > 0 || padding.right > 0 || padding.bottom > 0 || padding.left > 0;
          expect(hasPadding).toBeTruthy();
        }
      }
    }
  });

  test('Icons should maintain aspect ratio', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all SVG icons
    const icons = page.locator('svg');
    const count = await icons.count();
    
    for (let i = 0; i < Math.min(count, 30); i++) { // Check first 30
      const icon = icons.nth(i);
      const box = await icon.boundingBox();
      
      if (box && box.width > 0 && box.height > 0) {
        // Most icons should be square or close to square
        const aspectRatio = box.width / box.height;
        
        // Allow some variance but should be roughly square (0.8 to 1.2 ratio)
        expect(aspectRatio).toBeGreaterThan(0.7);
        expect(aspectRatio).toBeLessThan(1.3);
      }
    }
  });

  test('Touch targets should be adequate on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check Quick Actions buttons
    const buttons = page.locator('button:has(svg)');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // iOS minimum touch target is 44x44px
        // We allow slightly smaller for non-primary actions (40px)
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
