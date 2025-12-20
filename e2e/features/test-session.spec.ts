import { test, expect } from '@playwright/test';

/**
 * Test Session Tests
 * Tests for the test/quiz functionality
 */

test.describe('Test Session Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'frontend'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should load test session page for a channel', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasReadyState = await page.getByText('Start Test').isVisible({ timeout: 3000 }).catch(() => false);
    const hasNoTest = await page.getByText('No test available').isVisible({ timeout: 1000 }).catch(() => false) ||
                      await page.getByText('Go back home').isVisible({ timeout: 1000 }).catch(() => false);
    
    expect(hasReadyState || hasNoTest).toBeTruthy();
  });

  test('should display test info in ready state', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasReadyState = await page.getByText('Start Test').isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await expect(page.getByText('Questions')).toBeVisible();
      await expect(page.getByText('Passing Score')).toBeVisible();
      await expect(page.getByText('Question Types')).toBeVisible();
    }
  });

  test('should have back to channel button', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasReadyState = await page.getByText('Start Test').isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      const backButton = page.getByText('Back to Channel');
      await expect(backButton).toBeVisible();
      
      await backButton.click();
      await page.waitForTimeout(500);
      
      expect(page.url()).toContain('/channel/system-design');
    }
  });

  test('should start test when clicking Start Test button', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      const hasQuestion = await page.locator('h2').first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasProgress = await page.getByText(/\d+ \/ \d+/).isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasQuestion || hasProgress).toBeTruthy();
    }
  });

  test('should display timer during test', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1500);
      
      const timer = page.locator('.font-mono').filter({ hasText: /\d+:\d{2}/ });
      await expect(timer.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow selecting answer options', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      const options = page.locator('button.w-full.p-4.text-left.border.rounded-lg');
      const optionCount = await options.count();
      
      if (optionCount > 0) {
        await options.first().click();
        await page.waitForTimeout(300);
        await expect(options.first()).toHaveClass(/border-primary/);
      }
    }
  });

  test('should navigate between questions', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      await expect(page.getByText(/1 \/ \d+/)).toBeVisible();
      
      const nextButton = page.getByText('Next');
      if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);
        await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
        
        const prevButton = page.getByText('Previous');
        await prevButton.click();
        await page.waitForTimeout(500);
        await expect(page.getByText(/1 \/ \d+/)).toBeVisible();
      }
    }
  });
});

test.describe('Test Session - Completion', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should show results after submitting test', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      const dots = page.locator('button.w-2.h-2.rounded-full');
      const dotCount = await dots.count();
      
      for (let i = 0; i < dotCount; i++) {
        const options = page.locator('button.w-full.p-4.text-left.border.rounded-lg');
        if (await options.first().isVisible({ timeout: 1000 }).catch(() => false)) {
          await options.first().click();
        }
        
        if (i < dotCount - 1) {
          const nextButton = page.getByText('Next');
          if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
            await nextButton.click();
            await page.waitForTimeout(300);
          }
        }
      }
      
      const submitButton = page.getByText('Submit Test');
      if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        const hasResults = await page.getByText('Congratulations!').isVisible({ timeout: 3000 }).catch(() => false) ||
                          await page.getByText('Keep Practicing!').isVisible({ timeout: 1000 }).catch(() => false);
        expect(hasResults).toBeTruthy();
      }
    }
  });

  test('should have Try Again button after completion', async ({ page }) => {
    await page.goto('/test/system-design');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByText('Start Test');
    const hasReadyState = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasReadyState) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      const dots = page.locator('button.w-2.h-2.rounded-full');
      await dots.last().click();
      await page.waitForTimeout(500);
      
      const submitButton = page.getByText('Submit Test');
      if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        const tryAgainButton = page.getByText('Try Again');
        await expect(tryAgainButton).toBeVisible({ timeout: 3000 });
        
        await tryAgainButton.click();
        await page.waitForTimeout(1000);
        await expect(page.getByText(/1 \/ \d+/)).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe('Tests Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('marvel-intro-seen', 'true');
      localStorage.setItem('user-preferences', JSON.stringify({
        role: 'fullstack',
        subscribedChannels: ['system-design', 'algorithms', 'frontend', 'devops'],
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      }));
    });
  });

  test('should load the tests page', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Tests');
  });

  test('should display stats overview cards', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForLoadState('networkidle');
    
    const statsCards = page.locator('.border.border-border.p-3.bg-card.rounded-lg.text-center');
    await expect(statsCards).toHaveCount(4);
    
    await expect(page.getByText('Passed', { exact: false })).toBeVisible();
    await expect(page.getByText('Attempts', { exact: false })).toBeVisible();
    await expect(page.getByText('Avg Score', { exact: false })).toBeVisible();
    await expect(page.getByText('Available', { exact: false })).toBeVisible();
  });

  test('should navigate to test session when clicking a test card', async ({ page }) => {
    await page.goto('/tests');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const testCard = page.locator('.cursor-pointer.hover\\:border-primary\\/50').first();
    const hasTests = await testCard.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasTests) {
      await testCard.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/test/');
    }
  });
});
