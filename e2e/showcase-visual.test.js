// Info: F7 - Per-row visual baselines. A full-page screenshot of a 181-row
// gallery downscales to an unreadable smear. Capture per-row images instead
// for human review. These are NOT pixel baselines (toHaveScreenshot); font
// rendering differs between machines and CI runners. The machine-checkable
// assertions live in showcase-render.test.js.
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


// Images go to a gitignored directory
const SCREENSHOT_DIR = 'e2e/screenshots';

// Ensure the screenshot directory exists before tests run
test.beforeAll(function () {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});


// Bring a gallery row into view and return it. The galleries render their
// whole roster eagerly, so the row is already in the DOM and needs only to be
// scrolled to before a screenshot.
async function showRow (page, rowName) {
  const row = page.getByTestId('showcase-row-' + rowName);
  await expect(row).toBeAttached({ timeout: 10000 });
  await row.scrollIntoViewIfNeeded();
  return row;
}


// Components with known defects that should be captured first.
// Button and IconButton are atoms; the rest are molecules.
const CURATED_MOLECULES = ['CopyButton', 'ContainedList', 'MenuItem', 'Tooltip'];
const CURATED_ATOMS = ['Button'];


test.describe('showcase visual baselines', function () {

  test('should capture the showcase index', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'index.png'), fullPage: true });
  });

  test('should capture the full atoms page', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'atoms.png'), fullPage: true });
  });

  test('should capture the index after a Carbon scheme swap', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('scheme-option-carbon').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'index-carbon-scheme.png'), fullPage: true });
  });

  for (const name of CURATED_MOLECULES) {
    test('should capture the ' + name + ' molecule row', async function ({ page }) {
      await page.goto('/showcase/molecules');
      const row = await showRow(page, name);
      await row.screenshot({ path: path.join(SCREENSHOT_DIR, 'molecule-' + name + '.png') });
    });
  }

  for (const name of CURATED_ATOMS) {
    test('should capture the ' + name + ' atom row', async function ({ page }) {
      await page.goto('/showcase/atoms');
      const row = await showRow(page, name);
      await row.screenshot({ path: path.join(SCREENSHOT_DIR, 'atom-' + name + '.png') });
    });
  }

});
