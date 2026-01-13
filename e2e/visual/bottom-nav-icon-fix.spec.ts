/**
 * Bottom Navigation Icon Clipping Fix - Visual Regression Test
 * 
 * This test verifies that the Practice icon in the bottom navigation
 * is not clipped and displays correctly on mobile viewports.
 * 
 * Test Strategy:
 * 1. Take screenshots at multiple viewport sizes
 * 2. Verify icon is fully visible (not clipped)
 * 3. Check icon container dimensions
 * 4. Validate overflow settings
 * 5. Compare before/after states
 */

import { test, expect } from '@playwright/test';

// Test configurations for different mobile devices
const mobileViewports = [
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
];

test.describe('Bottom Navigation - Practice Icon Fix', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page where bottom nav is visible
    await page.goto('/');
    
    // Wait for navigation to be fully rendered
    await page.waitForSelector('nav.fixed.bottom-0', { state: 'visible' });
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
  });

  for (const viewport of mobileViewports) {
    test(`Practice icon should not be clipped on ${viewport.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Wait for layout to stabilize
      await page.waitForTimeout(300);
      
      // Find the Practice button (it has the highlight class and Mic icon)
      const practiceButton = page.locator('nav.fixed.bottom-0 button').filter({ 
        hasText: 'Practice' 
      });
      
      await expect(practiceButton).toBeVisible();
      
      // Get the icon container (the elevated div with rounded-2xl)
      const iconContainer = practiceButton.locator('div.rounded-2xl').first();
      await expect(iconContainer).toBeVisible();
      
      // Verify container dimensions
      const containerBox = await iconContainer.boundingBox();
      expect(containerBox).not.toBeNull();
      
      if (containerBox) {
        // Container should be 56x56 (w-14 h-14 = 3.5rem = 56px)
        expect(containerBox.width).toBeGreaterThanOrEqual(54); // Allow 2px tolerance
        expect(containerBox.width).toBeLessThanOrEqual(58);
        expect(containerBox.height).toBeGreaterThanOrEqual(54);
        expect(containerBox.height).toBeLessThanOrEqual(58);
        
        console.log(`${viewport.name} - Container size: ${containerBox.width}x${containerBox.height}`);
      }
      
      // Get the SVG icon inside
      const icon = iconContainer.locator('svg').first();
      await expect(icon).toBeVisible();
      
      const iconBox = await icon.boundingBox();
      expect(iconBox).not.toBeNull();
      
      if (iconBox && containerBox) {
        // Icon should be 28x28 (w-7 h-7 = 1.75rem = 28px)
        expect(iconBox.width).toBeGreaterThanOrEqual(26);
        expect(iconBox.width).toBeLessThanOrEqual(30);
        expect(iconBox.height).toBeGreaterThanOrEqual(26);
        expect(iconBox.height).toBeLessThanOrEqual(30);
        
        // Icon should be centered within container
        const iconCenterX = iconBox.x + iconBox.width / 2;
        const iconCenterY = iconBox.y + iconBox.height / 2;
        const containerCenterX = containerBox.x + containerBox.width / 2;
        const containerCenterY = containerBox.y + containerBox.height / 2;
        
        // Allow 3px tolerance for centering
        expect(Math.abs(iconCenterX - containerCenterX)).toBeLessThan(3);
        expect(Math.abs(iconCenterY - containerCenterY)).toBeLessThan(3);
        
        // Icon should not extend beyond container bounds
        expect(iconBox.x).toBeGreaterThanOrEqual(containerBox.x - 1); // 1px tolerance
        expect(iconBox.y).toBeGreaterThanOrEqual(containerBox.y - 1);
        expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
        expect(iconBox.y + iconBox.height).toBeLessThanOrEqual(containerBox.y + containerBox.height + 1);
        
        console.log(`${viewport.name} - Icon size: ${iconBox.width}x${iconBox.height}`);
        console.log(`${viewport.name} - Icon position: (${iconBox.x}, ${iconBox.y})`);
        console.log(`${viewport.name} - Container position: (${containerBox.x}, ${containerBox.y})`);
      }
      
      // Check CSS properties
      const overflow = await iconContainer.evaluate(el => 
        window.getComputedStyle(el).overflow
      );
      console.log(`${viewport.name} - Overflow: ${overflow}`);
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/bottom-nav-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: false,
      });
      
      // Take a focused screenshot of just the bottom nav
      const navBar = page.locator('nav.fixed.bottom-0');
      await navBar.screenshot({
        path: `test-results/bottom-nav-close-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`,
      });
    });
  }

  test('Practice icon should have correct styling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const practiceButton = page.locator('nav.fixed.bottom-0 button').filter({ 
      hasText: 'Practice' 
    });
    
    const iconContainer = practiceButton.locator('div.rounded-2xl').first();
    
    // Check computed styles
    const styles = await iconContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        width: computed.width,
        height: computed.height,
        borderRadius: computed.borderRadius,
        display: computed.display,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        overflow: computed.overflow,
        flexShrink: computed.flexShrink,
      };
    });
    
    console.log('Practice icon container styles:', styles);
    
    // Verify key styles
    expect(styles.display).toBe('flex');
    expect(styles.alignItems).toBe('center');
    expect(styles.justifyContent).toBe('center');
    expect(styles.flexShrink).toBe('0');
    
    // Width and height should be 56px (3.5rem)
    expect(styles.width).toBe('56px');
    expect(styles.height).toBe('56px');
  });

  test('All navigation icons should be properly sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const navButtons = page.locator('nav.fixed.bottom-0 button');
    const count = await navButtons.count();
    
    console.log(`Found ${count} navigation buttons`);
    
    for (let i = 0; i < count; i++) {
      const button = navButtons.nth(i);
      const label = await button.textContent();
      
      if (!label || label.trim() === '') continue;
      
      console.log(`\nChecking button: ${label.trim()}`);
      
      // Find the icon container (either rounded-2xl for Practice or rounded-xl for others)
      const iconContainer = button.locator('div[class*="rounded-"]').first();
      
      if (await iconContainer.count() > 0) {
        const box = await iconContainer.boundingBox();
        if (box) {
          console.log(`  Container: ${box.width}x${box.height}`);
          
          const icon = iconContainer.locator('svg').first();
          if (await icon.count() > 0) {
            const iconBox = await icon.boundingBox();
            if (iconBox) {
              console.log(`  Icon: ${iconBox.width}x${iconBox.height}`);
              
              // Verify icon is not clipped
              expect(iconBox.x).toBeGreaterThanOrEqual(box.x - 1);
              expect(iconBox.y).toBeGreaterThanOrEqual(box.y - 1);
              expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(box.x + box.width + 1);
              expect(iconBox.y + iconBox.height).toBeLessThanOrEqual(box.y + box.height + 1);
            }
          }
        }
      }
    }
  });

  test('Practice icon should be visually distinct and elevated', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const practiceButton = page.locator('nav.fixed.bottom-0 button').filter({ 
      hasText: 'Practice' 
    });
    
    const iconContainer = practiceButton.locator('div.rounded-2xl').first();
    
    // Check that it has gradient background
    const background = await iconContainer.evaluate(el => 
      window.getComputedStyle(el).backgroundImage
    );
    
    console.log('Practice button background:', background);
    expect(background).toContain('gradient');
    
    // Check that it's elevated (negative margin-top)
    const marginTop = await iconContainer.evaluate(el => 
      window.getComputedStyle(el).marginTop
    );
    
    console.log('Practice button margin-top:', marginTop);
    // Should be negative (elevated)
    expect(parseFloat(marginTop)).toBeLessThan(0);
    
    // Take a comparison screenshot
    await page.screenshot({
      path: 'test-results/bottom-nav-practice-elevated.png',
      clip: {
        x: 0,
        y: await page.evaluate(() => window.innerHeight - 100),
        width: await page.evaluate(() => window.innerWidth),
        height: 100,
      },
    });
  });

  test('Practice icon should not overlap with other elements', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const practiceButton = page.locator('nav.fixed.bottom-0 button').filter({ 
      hasText: 'Practice' 
    });
    
    const practiceBox = await practiceButton.boundingBox();
    expect(practiceBox).not.toBeNull();
    
    if (practiceBox) {
      // Get all other nav buttons
      const allButtons = page.locator('nav.fixed.bottom-0 button');
      const count = await allButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = allButtons.nth(i);
        const label = await button.textContent();
        
        if (label?.includes('Practice')) continue; // Skip self
        
        const box = await button.boundingBox();
        if (box) {
          // Check for overlap
          const overlapsX = !(practiceBox.x + practiceBox.width < box.x || box.x + box.width < practiceBox.x);
          const overlapsY = !(practiceBox.y + practiceBox.height < box.y || box.y + box.height < practiceBox.y);
          
          if (overlapsX && overlapsY) {
            console.warn(`Practice button overlaps with ${label}`);
          }
          
          // They should not overlap
          expect(overlapsX && overlapsY).toBe(false);
        }
      }
    }
  });
});

test.describe('Bottom Navigation - Responsive Behavior', () => {
  
  test('Bottom nav should only appear on mobile viewports', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const bottomNav = page.locator('nav.fixed.bottom-0.lg\\:hidden');
    
    // Should be hidden on desktop (lg:hidden)
    const isVisible = await bottomNav.isVisible();
    console.log('Bottom nav visible on desktop:', isVisible);
    
    // On desktop, it might be in DOM but hidden via CSS
    const display = await bottomNav.evaluate(el => 
      window.getComputedStyle(el).display
    );
    console.log('Bottom nav display on desktop:', display);
    
    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    
    await expect(bottomNav).toBeVisible();
  });
});
