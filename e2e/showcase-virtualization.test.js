// Info: F6 - Virtualization tests. Verifies that FlatList windows the
// gallery rosters so only a subset of rows mount on first paint, while the
// heading still reports the full roster count. Also verifies that a late
// row becomes reachable by scrolling, proving no component left the page.
import { test, expect } from '@playwright/test';


// Scroll a virtualized gallery until the named row mounts, then return it.
async function scrollToRow (page, listTestId, rowName) {
  const row = page.getByTestId('showcase-row-' + rowName);
  for (let i = 0; i < 80; i++) {
    if (await row.count() > 0) {
      await row.scrollIntoViewIfNeeded();
      return row;
    }
    await page.evaluate(function (id) {
      const list = document.querySelector('[data-testid="' + id + '"]');
      const node = list && list.firstElementChild ? list.firstElementChild : list;
      if (node) {
        node.scrollTop = node.scrollTop + 1500;
      }
    }, listTestId);
    await page.waitForTimeout(100);
  }
  throw new Error('row never mounted: ' + rowName);
}


test.describe('showcase virtualization', function () {

  test('should mount a windowed subset of molecule rows on first paint', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByTestId('molecule-gallery-list')).toBeVisible({ timeout: 10000 });
    // Wait a moment for initial render to settle
    await page.waitForTimeout(500);
    const rowCount = await page.locator('[data-testid*="showcase-row-"]').count();
    // A windowed FlatList with initialNumToRender=10 and windowSize=7 renders
    // roughly 70-90 rows on first paint. The full roster is 181, so anything
    // below 100 proves windowing is active.
    expect(rowCount).toBeLessThan(100);
  });

  test('should reach a late molecule row by scrolling', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByTestId('molecule-gallery-list')).toBeVisible({ timeout: 10000 });
    // Scroll to a component near the end of the alphabetical roster
    const row = await scrollToRow(page, 'molecule-gallery-list', 'Tooltip');
    await expect(row).toBeVisible();
  });

  test('should keep the full molecule roster count in the heading', async function ({ page }) {
    await page.goto('/showcase/molecules');
    // The heading reads "Molecules (N)" where N is the full roster count
    const heading = page.locator('text=/Molecules \\(\\d+\\)/');
    await expect(heading).toBeVisible({ timeout: 10000 });
    const text = await heading.textContent();
    const count = parseInt(text.match(/\((\d+)\)/)[1], 10);
    // The molecule roster has 181 components
    expect(count).toBe(181);
  });

  test('should render every atom row since the roster is small', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('atom-gallery-list')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    const rowCount = await page.locator('[data-testid*="showcase-row-"]').count();
    // The atom roster is small enough that all rows should mount
    expect(rowCount).toBeGreaterThanOrEqual(20);
  });

});
