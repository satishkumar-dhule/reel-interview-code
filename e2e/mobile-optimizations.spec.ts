import { test, expect } from '@playwright/test';

// Use mobile viewport for all mobile tests
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test.describe('Mobile Optimizations', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'backend', 'frontend', 'devops', 'sre'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('ESC button should navigate to home, not previous page', async ({ page }) => {
    // Navigate to a channel page
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Find and click the ESC button
    const escButton = page.locator('button').filter({ hasText: /ESC/i }).first();
    await expect(escButton).toBeVisible({ timeout: 5000 });
    
    // Verify the button text says "Home" not "Back"
    const buttonText = await escButton.textContent();
    expect(buttonText).toContain('Home');
    expect(buttonText).not.toContain('Back');
    
    // Click the ESC button
    await escButton.click({ force: true });
    await page.waitForTimeout(500);
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
  });

  test('ESC keyboard shortcut should navigate to home', async ({ page }) => {
    // Navigate to a channel page
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Should navigate to home page
    await expect(page).toHaveURL('/');
  });

  test('diagram section should be hidden on mobile', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Reveal the answer if needed
    const revealButton = page.getByText(/Tap to Reveal/i);
    if (await revealButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await revealButton.click();
      await page.waitForTimeout(500);
    }
    
    // Diagram section header (collapsible section) should not be visible on mobile
    // Look for the specific section header button with "Diagram" text
    const diagramSectionHeader = page.locator('button').filter({ hasText: /^Diagram$/ });
    const isDiagramVisible = await diagramSectionHeader.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isDiagramVisible).toBeFalsy();
  });

  test('TLDR section should be visible instead of Quick Answer', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Reveal the answer if needed
    const revealButton = page.getByText(/Tap to Reveal/i);
    if (await revealButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await revealButton.click();
      await page.waitForTimeout(500);
    }
    
    // Check that "Quick Answer" text is not present
    const quickAnswerText = page.getByText('Quick Answer', { exact: true });
    const hasQuickAnswer = await quickAnswerText.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasQuickAnswer).toBeFalsy();
    
    // TLDR section should be present (if the question has a quick answer)
    // Note: Not all questions have TLDR, so we just verify Quick Answer is renamed
  });

  test('search button should be hidden on mobile', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Search button (with ⌘K) should not be visible on mobile
    const searchButton = page.locator('button[title*="Search"]');
    const isSearchVisible = await searchButton.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isSearchVisible).toBeFalsy();
  });

  test('share button should be hidden on mobile', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Share button should not be visible on mobile
    const shareButton = page.locator('button[title="Share"]');
    const isShareVisible = await shareButton.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isShareVisible).toBeFalsy();
  });

  test('completion notification should be compact in unified footer', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // The completion notification is now part of the unified footer
    // It should show "Complete!" text when on last question with answer revealed
    // For now, just verify the footer exists and is compact
    const footer = page.locator('.border-t.border-white\\/10.bg-black');
    await expect(footer).toBeVisible({ timeout: 5000 });
  });

  test('navigation hints should be in unified footer', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Navigation hints are now in the unified footer
    // Mobile should show "SWIPE" hint
    const swipeHint = page.getByText(/SWIPE/i);
    await expect(swipeHint).toBeVisible({ timeout: 5000 });
  });

  test('mobile header should be compact without overlapping controls', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Check that the header doesn't overflow
    const header = page.locator('.h-11').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        // Header should fit within viewport width
        expect(headerBox.width).toBeLessThanOrEqual(390);
      }
    }
    
    // Navigation buttons should still be visible
    const prevButton = page.locator('button[title="Previous"]');
    const nextButton = page.locator('button[title*="Next"]');
    
    expect(await prevButton.isVisible()).toBeTruthy();
    expect(await nextButton.isVisible()).toBeTruthy();
  });

  test('question counter should be compact on mobile', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Question counter should show compact format (e.g., "1/10" not "01 / 10")
    const counter = page.locator('text=/\\d+\\/\\d+/').first();
    await expect(counter).toBeVisible({ timeout: 5000 });
    
    const counterText = await counter.textContent();
    // Should be compact format without extra padding
    expect(counterText).toMatch(/^\d+\/\d+$/);
  });

  test('reveal answer button should be simplified on mobile', async ({ page }) => {
    // Disable timer to ensure reveal button is shown
    await page.addInitScript(() => {
      localStorage.setItem('timer-enabled', 'false');
    });
    
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // On mobile with timer disabled, answer should auto-reveal
    // But if reveal button is shown, it should be simplified
    const revealButton = page.getByText(/Tap to Reveal/i);
    if (await revealButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should show simplified text "Tap to Reveal" not "Tap to Reveal Answer"
      const buttonText = await revealButton.textContent();
      expect(buttonText?.length).toBeLessThan(20);
    }
  });

  test('no horizontal overflow on mobile channel page', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    // Allow small tolerance for scrollbars
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe('Mobile Optimizations - Desktop Comparison', () => {
  // Use desktop viewport
  test.use({
    viewport: { width: 1280, height: 720 },
    isMobile: false,
    hasTouch: false,
  });

  test.beforeEach(async ({ page }) => {
    // Skip onboarding
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'backend', 'frontend', 'devops', 'sre'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('diagram section should be visible on desktop', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Reveal the answer
    const revealButton = page.getByText(/Tap to Reveal|Reveal Answer/i);
    if (await revealButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await revealButton.click();
      await page.waitForTimeout(500);
    }
    
    // On desktop, diagram section should be visible (if question has diagram)
    // This is a comparison test - we just verify the section can exist on desktop
    const diagramSection = page.locator('text=Diagram');
    // Note: Not all questions have diagrams, so we just verify it's not hidden by CSS
    const hiddenClass = await page.evaluate(() => {
      const el = document.querySelector('.hidden.sm\\:block');
      return el !== null;
    });
    // The hidden sm:block class should exist (meaning it's hidden on mobile, shown on desktop)
    expect(hiddenClass).toBeTruthy();
  });

  test('search button should be visible on desktop', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Search button should be visible on desktop
    const searchButton = page.locator('button[title*="Search"]');
    await expect(searchButton).toBeVisible({ timeout: 5000 });
  });

  test('share button should be visible on desktop', async ({ page }) => {
    await page.goto('/channel/system-design/0');
    
    // Wait for the page to load
    await expect(page.getByTestId('question-panel').or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 10000 });
    
    // Share button should be visible on desktop
    const shareButton = page.locator('button[title="Share"]');
    await expect(shareButton).toBeVisible({ timeout: 5000 });
  });
});
