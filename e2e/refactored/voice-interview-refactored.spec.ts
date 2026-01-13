/**
 * E2E Tests: Voice Interview (Refactored - Recording Indicator Only)
 * Tests voice interview with recording indicator but no time display
 */

import { test, expect } from '@playwright/test';
import { VoiceInterviewPage } from '../helpers/page-objects';
import {
  assertQuestionVisible,
  assertNoHorizontalScroll,
  waitForAnimation,
} from '../helpers/test-helpers';

test.describe('Voice Interview - Recording Indicator (Refactored)', () => {
  let voiceInterview: VoiceInterviewPage;

  test.beforeEach(async ({ page }) => {
    voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
  });

  test('should show recording indicator without time', async ({ page }) => {
    await voiceInterview.startRecording();
    
    // Recording indicator (red dot) should be visible
    const recordingIndicator = page.locator('[class*="pulse"], [class*="animate-pulse"]');
    await expect(recordingIndicator).toBeVisible();
    
    // Time display should NOT be visible
    const timeDisplay = page.locator('text=/\\d+:\\d+/');
    await expect(timeDisplay).not.toBeVisible();
  });

  test('should show "Recording" text instead of time', async ({ page }) => {
    await voiceInterview.startRecording();
    
    // Should show "Recording" text
    const recordingText = page.locator('text=/recording/i');
    await expect(recordingText).toBeVisible();
  });

  test('should have red dot with pulse animation', async ({ page }) => {
    await voiceInterview.startRecording();
    
    const redDot = page.locator('.animate-pulse').first();
    await expect(redDot).toBeVisible();
    
    // Check it has red background
    const bgColor = await redDot.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should be red-ish (simplified check)
    expect(bgColor).toContain('rgb');
  });

  test('should navigate between questions', async ({ page }) => {
    const initial = await voiceInterview.getCurrentQuestionNumber();
    
    await voiceInterview.skipQuestion();
    
    const next = await voiceInterview.getCurrentQuestionNumber();
    expect(next).toBe(initial + 1);
  });

  test('should show single progress counter', async ({ page }) => {
    const counter = await voiceInterview.questionCounter.textContent();
    expect(counter).toMatch(/^\d+\s*\/\s*\d+$/);
    
    // Only one counter should exist
    const counters = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').count();
    expect(counters).toBe(1);
  });
});

test.describe('Voice Interview - Mobile Experience', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  let voiceInterview: VoiceInterviewPage;

  test.beforeEach(async ({ page }) => {
    voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
  });

  test('should have no horizontal scroll', async ({ page }) => {
    await assertNoHorizontalScroll(page);
  });

  test('should have touch-friendly record button', async ({ page }) => {
    const recordButton = voiceInterview.recordButton;
    const box = await recordButton.boundingBox();
    
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should show recording indicator on mobile', async ({ page }) => {
    await voiceInterview.startRecording();
    
    const indicator = page.locator('.animate-pulse').first();
    await expect(indicator).toBeVisible();
    
    // Should be visible in viewport
    const box = await indicator.boundingBox();
    const viewport = page.viewportSize()!;
    
    if (box) {
      expect(box.y).toBeGreaterThan(0);
      expect(box.y + box.height).toBeLessThan(viewport.height);
    }
  });

  test('should not have content cutoff', async ({ page }) => {
    const questionText = page.locator('h2').first();
    const box = await questionText.boundingBox();
    const viewport = page.viewportSize()!;
    
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    }
  });
});

test.describe('Voice Interview - Evaluation', () => {
  let voiceInterview: VoiceInterviewPage;

  test.beforeEach(async ({ page }) => {
    voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
  });

  test('should show evaluation without time stats', async ({ page }) => {
    // Mock recording and evaluation
    await voiceInterview.startRecording();
    await page.waitForTimeout(1000);
    await voiceInterview.stopRecording();
    
    // Wait for evaluation
    await page.waitForTimeout(2000);
    
    // Should show evaluation
    await expect(voiceInterview.evaluationSection).toBeVisible({ timeout: 10000 });
    
    // Should NOT show time-based stats
    const timeStats = page.locator('text=/time|duration|seconds/i');
    await expect(timeStats).not.toBeVisible();
  });

  test('should show credits earned', async ({ page }) => {
    await voiceInterview.startRecording();
    await page.waitForTimeout(1000);
    await voiceInterview.stopRecording();
    
    await page.waitForTimeout(2000);
    
    // Should show credits
    await expect(voiceInterview.creditsDisplay).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Voice Interview - Visual Regression', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should match visual snapshot - initial state', async ({ page }) => {
    const voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
    
    await expect(page).toHaveScreenshot('voice-interview-initial.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match visual snapshot - recording state', async ({ page }) => {
    const voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
    await voiceInterview.startRecording();
    
    await expect(page).toHaveScreenshot('voice-interview-recording.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Voice Interview - Accessibility', () => {
  let voiceInterview: VoiceInterviewPage;

  test.beforeEach(async ({ page }) => {
    voiceInterview = new VoiceInterviewPage(page);
    await voiceInterview.goto();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await expect(voiceInterview.recordButton).toHaveAttribute('aria-label', /.+/);
  });

  test('should announce recording state', async ({ page }) => {
    // Check for live region
    const liveRegion = page.locator('[aria-live]');
    await expect(liveRegion).toBeAttached();
  });
});
