// Info: F4 - Theme stability tests. The regression lock for the re-derive
// loop. A runaway build count is invisible to a functional assertion but is
// the loudest possible signal that the theme is spinning. The count is
// exposed on globalThis.__systemBuilds by build-system.js (the transform
// build). useRegistry consumes the built system from the context and does
// not create its own build, so each intentional theme change produces 1
// build.
import { test, expect } from '@playwright/test';


// Wait for the build count to settle, then read it. A 2.5 second settle
// window is enough for any async font load or re-derive to complete.
async function getBuildCount (page) {
  await page.waitForTimeout(2500);
  return page.evaluate(function () {
    return globalThis.__systemBuilds || 0;
  });
}


test.describe('showcase theme stability', function () {

  test('should build the system once when mounting the showcase index', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    // 1 build: transform (build-system.js)
    expect(count).toBe(1);
  });

  test('should build the system once when mounting the atoms page', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    expect(count).toBe(1);
  });

  test('should build the system at most twice when mounting the molecules page', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByText('Molecules')).toBeVisible({ timeout: 10000 });
    const count = await getBuildCount(page);
    // The molecules page renders 181 components; a single font-load re-derive
    // is acceptable (adding 1 more build), but a count above 2 indicates a
    // runaway loop.
    expect(count).toBeLessThanOrEqual(2);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should rebuild exactly once after a single scheme swap', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Click g10 (not white, which is the initial scheme) to ensure a state change
    await page.getByTestId('scheme-option-g10').click();
    const after = await getBuildCount(page);
    // 1 build: transform
    expect(after - before).toBe(1);
  });

  test('should not rebuild while idle', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Wait 3 seconds and confirm the count is unchanged
    await page.waitForTimeout(3000);
    const after = await getBuildCount(page);
    expect(after).toBe(before);
  });

  test('should rebuild exactly once after a profile switch to Material', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Switch from Carbon to Material - this changes both template and layers
    await page.getByTestId('profile-option-material').click();
    await expect(page.getByTestId('scheme-option-light')).toBeVisible({ timeout: 10000 });
    const after = await getBuildCount(page);
    // 1 build: transform
    expect(after - before).toBe(1);
  });

  test('should rebuild exactly once after switching back to Carbon from Material', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    // Switch to Material first
    await page.getByTestId('profile-option-material').click();
    await expect(page.getByTestId('scheme-option-light')).toBeVisible({ timeout: 10000 });
    const before = await getBuildCount(page);
    // Switch back to Carbon
    await page.getByTestId('profile-option-carbon').click();
    await expect(page.getByTestId('scheme-option-white')).toBeVisible({ timeout: 10000 });
    const after = await getBuildCount(page);
    // 1 build: transform
    expect(after - before).toBe(1);
  });

  test('should rebuild exactly once after a brand switch', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible({ timeout: 10000 });
    // The showcase mounts under the tasks brand; switch to notes first
    await page.getByTestId('brand-option-notes').click();
    const before = await getBuildCount(page);
    // Switch brand back to tasks - this only changes layers, not the template
    await page.getByTestId('brand-option-tasks').click();
    const after = await getBuildCount(page);
    // 1 build: transform
    expect(after - before).toBe(1);
  });

});
