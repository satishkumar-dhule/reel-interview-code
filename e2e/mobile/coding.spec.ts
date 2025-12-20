import { test, expect, Page } from '@playwright/test';

/**
 * Mobile Coding Challenge Collapsible Sections Tests
 */

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('marvel-intro-seen', 'true');
    localStorage.setItem('user-preferences', JSON.stringify({
      role: 'fullstack',
      subscribedChannels: ['system-design', 'algorithms', 'backend', 'frontend'],
      onboardingComplete: true,
      createdAt: new Date().toISOString()
    }));
  });
}

test.describe('Mobile Coding Challenge - Collapsible Sections', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  test('Problem description panel should be collapsible on mobile', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const problemToggle = page.getByTestId('problem-collapse-toggle');
    await expect(problemToggle).toBeVisible();
    
    const problemContent = page.getByTestId('problem-content');
    await expect(problemContent).toBeVisible();
    
    await problemToggle.click();
    await page.waitForTimeout(500);
    await expect(problemContent).not.toBeVisible();
    
    await problemToggle.click();
    await page.waitForTimeout(500);
    await expect(problemContent).toBeVisible();
  });

  test('Code editor panel should be collapsible on mobile', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const codeToggle = page.getByTestId('code-collapse-toggle');
    await expect(codeToggle).toBeVisible();
    
    const codeContent = page.getByTestId('code-content');
    await expect(codeContent).toBeVisible();
    
    await codeToggle.click();
    await page.waitForTimeout(500);
    await expect(codeContent).not.toBeVisible();
    
    await codeToggle.click();
    await page.waitForTimeout(500);
    await expect(codeContent).toBeVisible();
  });

  test('Both panels can be collapsed independently', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const problemToggle = page.getByTestId('problem-collapse-toggle');
    const codeToggle = page.getByTestId('code-collapse-toggle');
    const problemContent = page.getByTestId('problem-content');
    const codeContent = page.getByTestId('code-content');
    
    await expect(problemContent).toBeVisible();
    await expect(codeContent).toBeVisible();
    
    await problemToggle.click();
    await page.waitForTimeout(300);
    await expect(problemContent).not.toBeVisible();
    await expect(codeContent).toBeVisible();
    
    await codeToggle.click();
    await page.waitForTimeout(300);
    await expect(problemContent).not.toBeVisible();
    await expect(codeContent).not.toBeVisible();
    
    await problemToggle.click();
    await page.waitForTimeout(300);
    await expect(problemContent).toBeVisible();
    await expect(codeContent).not.toBeVisible();
    
    await codeToggle.click();
    await page.waitForTimeout(300);
    await expect(problemContent).toBeVisible();
    await expect(codeContent).toBeVisible();
  });

  test('Hints section should be collapsible', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hintsToggle = page.getByTestId('hints-toggle');
    
    if (await hintsToggle.isVisible()) {
      const hintsContainer = page.getByTestId('hints-container');
      await expect(hintsContainer).not.toBeVisible();
      
      await hintsToggle.click();
      await page.waitForTimeout(500);
      await expect(hintsContainer).toBeVisible();
      
      await hintsToggle.click();
      await page.waitForTimeout(500);
      await expect(hintsContainer).not.toBeVisible();
    }
  });

  test('Action buttons should be accessible on mobile', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const copyBtn = page.getByTestId('copy-btn');
    const resetBtn = page.getByTestId('reset-btn');
    const runBtn = page.getByTestId('run-tests-btn');
    const revealBtn = page.getByTestId('reveal-solution-btn');
    
    await expect(copyBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();
    await expect(runBtn).toBeVisible();
    await expect(revealBtn).toBeVisible();
    
    for (const btn of [copyBtn, resetBtn, runBtn, revealBtn]) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(30);
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('Collapsible toggle buttons should be touch-friendly', async ({ page }) => {
    await page.goto('/coding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const firstChallenge = page.getByTestId('challenge-card-0');
    await firstChallenge.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const problemToggle = page.getByTestId('problem-collapse-toggle');
    const codeToggle = page.getByTestId('code-collapse-toggle');
    
    for (const toggle of [problemToggle, codeToggle]) {
      const box = await toggle.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
        expect(box.width).toBeGreaterThanOrEqual(300);
      }
    }
  });
});
