// Info: Showcase error rejection test. Asserts zero SafeSample error cards
// and zero console/page errors across the complete showcase roster under
// the default supported profile. This test fails when any component throws
// during rendering, ensuring the showcase is truthful about component health.
import { test, expect } from '@playwright/test';


test.describe('showcase error rejection', function () {

  test('atoms page has zero error cards and zero console errors', async function ({ page }) {

    const errors = [];
    page.on('console', function (msg) {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', function (err) {
      errors.push(String(err));
    });

    await page.goto('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Assert no SafeSample error cards (red "x" fallback elements)
    const errorCards = await page.locator('text=/^x$/').count();
    expect(errorCards).toBe(0);

    // Assert no console or page errors
    expect(errors).toEqual([]);
  });

  test('molecules page has zero error cards and zero console errors', async function ({ page }) {

    const errors = [];
    page.on('console', function (msg) {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', function (err) {
      errors.push(String(err));
    });

    await page.goto('/showcase/molecules');
    await expect(page.getByText('Molecules')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Assert no SafeSample error cards (red "x" fallback elements)
    const errorCards = await page.locator('text=/^x$/').count();
    expect(errorCards).toBe(0);

    // Assert no console or page errors
    expect(errors).toEqual([]);
  });

  test('composites page has zero error cards and zero console errors', async function ({ page }) {

    const errors = [];
    page.on('console', function (msg) {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', function (err) {
      errors.push(String(err));
    });

    await page.goto('/showcase/composites');
    await expect(page.getByText('Composites')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Assert no SafeSample error cards (red "x" fallback elements)
    const errorCards = await page.locator('text=/^x$/').count();
    expect(errorCards).toBe(0);

    // Assert no console or page errors
    expect(errors).toEqual([]);
  });

});
