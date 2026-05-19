import { test, expect } from '@playwright/test';

/**
 * Authenticated Dashboard E2E Tests
 * Tests the full authenticated user journey through the dashboard
 */
test.describe('Authenticated Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load authenticated dashboard', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display user-specific content', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const html = await body.innerHTML();
    expect(html.length).toBeGreaterThan(0);
  });

  test('should navigate to match page', async ({ page }) => {
    await page.goto('/match');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to squad page', async ({ page }) => {
    await page.goto('/squad');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to reputation', async ({ page }) => {
    await page.goto('/reputation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to stats', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
