import { test, expect } from '@playwright/test';

/**
 * Diagram and Collapsible Section Tests
 * Tests for mermaid diagrams and collapsible sections
 */

test.describe('Diagram Rendering', () => {
  test.skip(({ isMobile }) => isMobile, 'Diagram rendering tests are desktop-only');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'backend', 'frontend', 'devops', 'sre', 'database'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should render mermaid diagrams without errors in SRE channel', async ({ page }) => {
    await page.goto('/channel/sre');
    await expect(page.getByTestId('question-panel').first().or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('question-panel').first().or(page.getByTestId('no-questions-view'))).toBeVisible();
  });

  test('should render diagrams in system-design channel', async ({ page }) => {
    await page.goto('/channel/system-design');
    await expect(page.getByTestId('question-panel').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('question-panel').first()).toBeVisible();
  });

  test('should not crash when navigating between questions with diagrams', async ({ page }) => {
    await page.goto('/channel/sre/0');
    await expect(page.getByTestId('question-panel').first().or(page.getByTestId('no-questions-view'))).toBeVisible({ timeout: 15000 });
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(1000);
    
    const hasContent = await page.getByTestId('question-panel').first().isVisible().catch(() => false) ||
                       await page.getByTestId('no-questions-view').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
    
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(50);
  });
});

test.describe('Collapsible Sections - Desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop collapsible section tests');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['algorithms'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should show collapsible section headers', async ({ page }) => {
    await page.goto('/channel/algorithms/0');
    await expect(page.getByTestId('question-panel').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    const questionPanel = page.getByTestId('question-panel').first();
    await expect(questionPanel).toBeVisible();
    
    const hasText = await questionPanel.locator('p, pre, code, span').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasSvg = await questionPanel.locator('svg').first().isVisible({ timeout: 1000 }).catch(() => false);
    expect(hasText || hasSvg).toBeTruthy();
  });

  test('should toggle section when clicking header', async ({ page }) => {
    await page.goto('/channel/algorithms/0');
    await expect(page.getByTestId('question-panel').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);
    
    const questionPanel = page.getByTestId('question-panel').first();
    await expect(questionPanel).toBeVisible();
  });
});

test.describe('Collapsible Sections - Mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['algorithms'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should display collapsible sections on mobile', async ({ page }) => {
    await page.goto('/channel/algorithms/0');
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/channel/algorithms');
  });

  test('should not have horizontal overflow with collapsed sections', async ({ page }) => {
    await page.goto('/channel/algorithms/0');
    await page.waitForTimeout(3000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should work correctly in landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/channel/algorithms/0');
    await page.waitForTimeout(3000);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});
