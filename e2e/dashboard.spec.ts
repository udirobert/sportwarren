import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 * Critical user journey: Dashboard loading and navigation
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should load dashboard without errors', async ({ page }) => {
    // Check no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to settle
    await page.waitForLoadState('networkidle');

    // Verify dashboard loads (check for key elements)
    await expect(page.locator('body')).toBeVisible();

    // No critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Third-party cookie')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should display navigation', async ({ page }) => {
    // Check top navigation exists
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Dashboard should still load
    await expect(page.locator('body')).toBeVisible();

    // Bottom navigation should be visible on mobile
    const bottomNav = page.locator('[class*=\"bottom-0\"]');
    await expect(bottomNav.first()).toBeVisible();
  });
});

/**
 * Match Center E2E Tests
 * Critical user journey: Match logging flow
 */
test.describe('Match Center', () => {
  test('should navigate to match center', async ({ page }) => {
    await page.goto('/match');
    await page.waitForLoadState('networkidle');

    // Page should load without crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display match tabs', async ({ page }) => {
    await page.goto('/match');

    // Check for match mode tabs
    const previewTab = page.getByText('Match Preview');
    const captureTab = page.getByText('Submit Result');

    // At least one tab should be visible
    const hasPreview = await previewTab.isVisible().catch(() => false);
    const hasCapture = await captureTab.isVisible().catch(() => false);
    
    expect(hasPreview || hasCapture).toBeTruthy();
  });
});

/**
 * Health Check E2E Tests
 * Production readiness validation
 */
test.describe('Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('services');
    expect(data.services).toHaveProperty('database');
  });
});

/**
 * Squad Page E2E Tests
 * Critical user journey: Squad management
 */
test.describe('Squad', () => {
  test('should navigate to squad page', async ({ page }) => {
    await page.goto('/squad');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display squad creation or view', async ({ page }) => {
    await page.goto('/squad');

    // Either squad view or creation prompt
    const hasContent = await page.locator('[class*=\"rounded\"]').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});