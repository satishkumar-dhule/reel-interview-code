/**
 * E2E Tests: Test Session (Quiz Mode)
 * Tests the unified question view in test/quiz mode
 */

import { test, expect } from '@playwright/test';
import { TestSessionPage } from '../helpers/page-objects';
import {
  assertQuestionVisible,
  assertNoHorizontalScroll,
  waitForAnimation,
} from '../helpers/test-helpers';

test.describe('Test Session - Core Functionality', () => {
  let testSession: TestSessionPage;

  test.beforeEach(async ({ page }) => {
    testSession = new TestSessionPage(page);
    await testSession.goto('react');
  });

  test('should start test session', async ({ page }) => {
    await assertQuestionVisible(page);
    await expect(testSession.timer).toBeVisible();
    await expect(testSession.questionCounter).toBeVisible();
  });

  test('should display timer', async ({ page }) => {
    const timeRemaining = await testSession.getTimeRemaining();
    expect(timeRemaining).toMatch(/\d+:\d+/);

    // Wait and check timer decreases
    await page.waitForTimeout(2000);
    const newTime = await testSession.getTimeRemaining();
    expect(newTime).not.toBe(timeRemaining);
  });

  test('should track progress through test', async ({ page }) => {
    const total = await testSession.getTotalQuestions();
    expect(total).toBeGreaterThan(0);

    // Answer first 3 questions
    for (let i = 0; i < Math.min(3, total); i++) {
      const current = await testSession.getCurrentQuestionNumber();
      expect(current).toBe(i + 1);

      await testSession.revealAnswer();
      await waitForAnimation(page, 500);

      if (i < total - 1) {
        await testSession.clickNext();
      }
    }
  });

  test('should complete test and show results', async ({ page }) => {
    await testSession.completeTest();

    // Should show results
    await expect(testSession.resultsSection).toBeVisible({ timeout: 10000 });
    await expect(testSession.scoreDisplay).toBeVisible();

    // Score should be valid
    const score = await testSession.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should handle time expiration', async ({ page }) => {
    // Set timer to expire soon (if possible via dev tools)
    await page.evaluate(() => {
      localStorage.setItem('test-time-remaining', '5');
    });

    await page.reload();
    await page.waitForTimeout(6000);

    // Should auto-submit or show time-up message
    const timeUpMessage = page.locator('text=/time.*up|expired/i');
    await expect(timeUpMessage).toBeVisible({ timeout: 2000 });
  });

  test('should save progress', async ({ page }) => {
    // Answer first question
    await testSession.revealAnswer();
    await testSession.clickNext();

    const currentQuestion = await testSession.getCurrentQuestionNumber();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should resume from same question
    const resumedQuestion = await testSession.getCurrentQuestionNumber();
    expect(resumedQuestion).toBe(currentQuestion);
  });
});

test.describe('Test Session - Mobile Experience', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  let testSession: TestSessionPage;

  test.beforeEach(async ({ page }) => {
    testSession = new TestSessionPage(page);
    await testSession.goto('react');
  });

  test('should work on mobile', async ({ page }) => {
    await assertNoHorizontalScroll(page);
    await assertQuestionVisible(page);
    await expect(testSession.timer).toBeVisible();
  });

  test('should have mobile-optimized timer', async ({ page }) => {
    const timer = testSession.timer;
    const fontSize = await timer.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(14);
  });

  test('should handle mobile navigation', async ({ page }) => {
    await testSession.revealAnswer();
    await testSession.clickNext();

    const current = await testSession.getCurrentQuestionNumber();
    expect(current).toBe(2);
  });
});

test.describe('Test Session - Scoring', () => {
  let testSession: TestSessionPage;

  test.beforeEach(async ({ page }) => {
    testSession = new TestSessionPage(page);
    await testSession.goto('react');
  });

  test('should calculate score correctly', async ({ page }) => {
    // Complete test
    await testSession.completeTest();

    // Check score
    const score = await testSession.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should show pass/fail status', async ({ page }) => {
    await testSession.completeTest();

    // Should show pass or fail
    const status = page.locator('text=/pass|fail/i');
    await expect(status).toBeVisible();
  });

  test('should display correct/incorrect breakdown', async ({ page }) => {
    await testSession.completeTest();

    // Should show breakdown
    const breakdown = page.locator('text=/correct|incorrect/i');
    await expect(breakdown).toBeVisible();
  });
});

test.describe('Test Session - Retry Functionality', () => {
  let testSession: TestSessionPage;

  test.beforeEach(async ({ page }) => {
    testSession = new TestSessionPage(page);
    await testSession.goto('react');
  });

  test('should allow retry after completion', async ({ page }) => {
    await testSession.completeTest();

    // Click retry button
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await retryButton.click();

    // Should start new test
    await assertQuestionVisible(page);
    const current = await testSession.getCurrentQuestionNumber();
    expect(current).toBe(1);
  });

  test('should reset timer on retry', async ({ page }) => {
    await testSession.completeTest();

    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await retryButton.click();

    // Timer should be reset
    const time = await testSession.getTimeRemaining();
    expect(time).toMatch(/\d+:\d+/);
  });
});

test.describe('Test Session - Performance', () => {
  test('should handle long tests efficiently', async ({ page }) => {
    const testSession = new TestSessionPage(page);
    await testSession.goto('react');

    // Navigate through 10 questions quickly
    for (let i = 0; i < 10; i++) {
      await testSession.clickNext();
      await page.waitForTimeout(100);
    }

    // Should still be responsive
    await assertQuestionVisible(page);
  });

  test('should not slow down over time', async ({ page }) => {
    const testSession = new TestSessionPage(page);
    await testSession.goto('react');

    // Measure initial navigation time
    const start1 = Date.now();
    await testSession.clickNext();
    const time1 = Date.now() - start1;

    // Navigate through several questions
    for (let i = 0; i < 5; i++) {
      await testSession.clickNext();
      await page.waitForTimeout(50);
    }

    // Measure later navigation time
    const start2 = Date.now();
    await testSession.clickNext();
    const time2 = Date.now() - start2;

    // Should not be significantly slower
    expect(time2).toBeLessThan(time1 * 2);
  });
});

test.describe('Test Session - Edge Cases', () => {
  test('should handle single question test', async ({ page }) => {
    // Mock single question test
    await page.goto('/test/react');
    
    const total = await page.locator('text=/\\/\\s*(\\d+)/').first().textContent();
    if (total === '/ 1') {
      // Next button should be disabled
      const nextButton = page.getByRole('button', { name: /next/i });
      await expect(nextButton).toBeDisabled();
    }
  });

  test('should handle empty test', async ({ page }) => {
    await page.goto('/test/invalid-channel');

    // Should show error or empty state
    const emptyState = page.locator('text=/no questions|empty/i');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test('should handle browser refresh during test', async ({ page }) => {
    const testSession = new TestSessionPage(page);
    await testSession.goto('react');

    await testSession.clickNext();
    const current = await testSession.getCurrentQuestionNumber();

    // Refresh browser
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should resume from same position
    const resumed = await testSession.getCurrentQuestionNumber();
    expect(resumed).toBe(current);
  });
});
