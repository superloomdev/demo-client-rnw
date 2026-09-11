// Info: F4 - Visual baseline tests. 3 pages x 4 D3 viewports = 12 baselines.
// Runs in the pinned Docker image for platform-consistent Linux Chromium
// snapshots. Uses maxDiffPixels: 0 for exact pixel comparison.
import { test, expect } from '@playwright/test';

// D3 viewports
const VIEWPORTS = {
  'mobile-320': { width: 320, height: 568 },
  'mobile-375': { width: 375, height: 667 },
  'tablet-768': { width: 768, height: 1024 },
  'desktop-1280': { width: 1280, height: 720 }
};

// Pages to capture
const PAGES = ['/', '/tasks', '/notes'];

// Generate test for each page x viewport combination
for (const route of PAGES) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {

    test('visual baseline - ' + route + ' @ ' + viewportName, async function ({ page }) {
      await page.setViewportSize(viewport);
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Wait for fonts to be ready
      await page.evaluate(function () {
        return document.fonts.ready;
      });

      // Wait for the page to be stable
      await page.waitForTimeout(1000);

      // Take a full-page screenshot and compare against the baseline
      await expect(page).toHaveScreenshot(route.replace('/', 'root') + '-' + viewportName + '.png', {
        maxDiffPixels: 0,
        fullPage: true,
        animations: 'disabled'
      });
    });

  }
}
