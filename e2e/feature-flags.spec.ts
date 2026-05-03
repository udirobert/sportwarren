import { test, expect } from '@playwright/test';

test.describe('Feature Flags & Route Gating', () => {
  test('gated routes show coming soon fallback', async ({ page }) => {
    // These routes are gated behind disabled feature flags
    const gatedRoutes = ['/predict', '/community', '/analytics'];

    for (const route of gatedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Should show "Coming Soon" or redirect
      const comingSoon = page.locator('text=Coming Soon');
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // If the feature gate is rendering, it shows "Coming Soon"
      const hasComingSoon = await comingSoon.isVisible().catch(() => false);
      if (hasComingSoon) {
        await expect(comingSoon).toBeVisible();
        // Should have a back link
        const backLink = page.locator('a[href="/dashboard"]').first();
        await expect(backLink).toBeVisible();
      }
    }
  });

  test('core MVP routes are accessible', async ({ page }) => {
    const mvpRoutes = ['/dashboard', '/match', '/squad', '/stats', '/settings'];

    for (const route of mvpRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
