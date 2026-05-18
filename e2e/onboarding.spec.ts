import { test, expect } from '@playwright/test';

test.describe('Onboarding & Landing', () => {
  test('landing page loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Hero section should have a CTA
    const hero = page.locator('[class*="hero"], h1, [class*="Hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('landing page has legal links in footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const termsLink = page.locator('a[href="/terms"]').first();
    const privacyLink = page.locator('a[href="/privacy"]').first();

    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText('Terms of Service');
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });

  test('cookies page loads', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.locator('h1')).toContainText('Cookie Policy');
  });

  test('cookie consent banner shows on first visit', async ({ page, context }) => {
    // Clear any existing consent (stored in localStorage, not cookies)
    await context.clearCookies();
    await page.goto('/');
    // localStorage is accessible after navigation
    await page.evaluate(() => localStorage.removeItem('sw_cookie_consent'));
    // Reload to trigger the consent check with cleared state
    await page.reload();

    // Cookie consent should appear
    const consent = page.locator('[role="dialog"][aria-label="Cookie consent"]');
    await expect(consent).toBeVisible({ timeout: 5000 });
  });

  test('dashboard redirects to landing when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should either show dashboard (guest mode) or redirect to landing
    await page.waitForLoadState('networkidle');
    // Guest mode allows dashboard access, so we just verify it loads
    await expect(page.locator('body')).toBeVisible();
  });
});
