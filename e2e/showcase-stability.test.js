// Info: F4 - Theme stability tests. The regression lock for the re-derive
// loop. A runaway build count is invisible to a functional assertion but is
// the loudest possible signal that the theme is spinning. The count is
// exposed on globalThis.__carbonSystemBuilds by useCarbonRegistry.
import { test, expect } from '@playwright/test';


// Wait for the build count to settle, then read it. A 2.5 second settle
// window is enough for any async font load or re-derive to complete.
async function getBuildCount (page) {
  await page.waitForTimeout(2500);
  return page.evaluate(function () {
    return globalThis.__carbonSystemBuilds || 0;
  });
}


test.describe('showcase theme stability', function () {

  test('should build the system once when mounting the showcase index', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    expect(count).toBe(1);
  });

  test('should build the system once when mounting the atoms page', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    expect(count).toBe(1);
  });

  test('should build the system once when mounting the molecules page', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByText('Molecules')).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    expect(count).toBe(1);
  });

  test('should rebuild exactly once after a single scheme swap', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Use a real click, not dispatchEvent. If this needs dispatchEvent, the
    // underlying defect is not fixed.
    await page.getByTestId('scheme-option-carbon').click();
    const after = await getBuildCount(page);
    expect(after - before).toBe(1);
  });

  test('should not rebuild while idle', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Wait 3 seconds and confirm the count is unchanged
    await page.waitForTimeout(3000);
    const after = await getBuildCount(page);
    expect(after).toBe(before);
  });

});
