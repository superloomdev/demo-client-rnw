// Info: D2 - Page readiness tests. For each route /, /tasks, /notes:
// attach error listeners before navigation, assert main document response
// status 200, wait for fonts ready, assert nonempty visible root, and
// exercise one primary interaction using role/label locators. No error is
// filtered by message unless documented and asserted as a known third-party
// exception.
import { test, expect } from '@playwright/test';
import { attachErrorListeners, ROUTES } from './helpers/page-readiness.js';

// Route-specific visible content selectors for readiness checks.
const ROUTE_CONTENT = {
  '/': 'Nimbus',
  '/tasks': 'Welcome to Nimbus',
  '/notes': 'First note'
};

// Route-specific primary interaction selectors.
const ROUTE_INTERACTION = {
  '/': { text: 'Tasks', target: '/tasks' },
  '/tasks': { text: 'Back to launcher', target: '/' },
  '/notes': { text: 'Back to launcher', target: '/' }
};

for (const route of ROUTES) {

  test.describe('page readiness - ' + route, function () {

    test('should load with HTTP 200 and no console/page errors', async function ({ page }) {
      const getErrors = attachErrorListeners(page);

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();
      expect(response.status()).toBe(200);

      // Wait for fonts to be ready
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);

      // Assert nonempty visible root
      const rootVisible = await page.evaluate(function () {
        const root = document.getElementById('root');
        if (!root) {
          return false;
        }
        const rect = root.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      expect(rootVisible).toBe(true);

      // Assert no errors
      const errors = getErrors();
      expect(errors).toEqual([]);
    });

    test('should have visible primary content after load', async function ({ page }) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);

      const contentText = ROUTE_CONTENT[route];
      await expect(page.getByText(contentText).first()).toBeVisible({ timeout: 10000 });
    });

    test('should exercise one primary interaction', async function ({ page }) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);

      const interaction = ROUTE_INTERACTION[route];
      const element = page.getByText(interaction.text).first();
      await expect(element).toBeVisible({ timeout: 10000 });
      await element.dispatchEvent('click');
      await page.waitForURL('**' + interaction.target, { timeout: 10000 });
    });

  });

}
