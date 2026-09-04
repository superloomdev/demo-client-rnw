// Info: F3 - Render correctness tests. Asserts on computed style, which is
// the only way to catch a silently dropped utility. A button that renders
// without a background because its token was dead looks identical to a
// working button in a DOM tree assertion.
import { test, expect } from '@playwright/test';


// Find the button element inside a labelled state cell within the Button row
async function getButtonStyle (page, label) {
  return page.locator('[data-testid="showcase-row-Button"]').evaluate(function (row, lbl) {
    // Find the label text node, then walk up to the cell and find the button
    const allText = Array.from(row.querySelectorAll('*'));
    const labelNode = allText.find(function (el) {
      return el.textContent === lbl && el.childElementCount === 0;
    });
    if (!labelNode) {
      return null;
    }
    // The button is a sibling or cousin within the same state cell
    let cell = labelNode.parentElement;
    while (cell && cell !== row) {
      const btn = cell.querySelector('[role="button"], button');
      if (btn) {
        const cs = window.getComputedStyle(btn);
        return {
          backgroundColor: cs.backgroundColor,
          height: btn.getBoundingClientRect().height,
          paddingLeft: parseFloat(cs.paddingLeft)
        };
      }
      cell = cell.parentElement;
    }
    return null;
  }, label);
}


test.describe('showcase render correctness', function () {

  test('should show a visible background on the primary button', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const style = await getButtonStyle(page, 'primary');
    expect(style).not.toBeNull();
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.backgroundColor).not.toBe('transparent');
  });

  test('should show a visible background on the secondary button', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const style = await getButtonStyle(page, 'secondary');
    expect(style).not.toBeNull();
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.backgroundColor).not.toBe('transparent');
  });

  test('should show a visible background on the danger button', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const style = await getButtonStyle(page, 'danger');
    expect(style).not.toBeNull();
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.backgroundColor).not.toBe('transparent');
  });

  test('should render every button kind at least 44px tall', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const labels = ['primary', 'secondary', 'danger'];
    for (const label of labels) {
      const style = await getButtonStyle(page, label);
      expect(style).not.toBeNull();
      expect(style.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should apply horizontal padding to every button kind', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const labels = ['primary', 'secondary', 'danger'];
    for (const label of labels) {
      const style = await getButtonStyle(page, label);
      expect(style).not.toBeNull();
      expect(style.paddingLeft).toBeGreaterThan(0);
    }
  });

  test('should render primary button text in a color that contrasts its background', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page.getByTestId('showcase-row-Button')).toBeVisible({ timeout: 10000 });
    const contrast = await page.locator('[data-testid="showcase-row-Button"]').evaluate(function (row) {
      const allText = Array.from(row.querySelectorAll('*'));
      const labelNode = allText.find(function (el) {
        return el.textContent === 'primary' && el.childElementCount === 0;
      });
      if (!labelNode) {
        return { bg: '', fg: '' };
      }
      let cell = labelNode.parentElement;
      while (cell && cell !== row) {
        const btn = cell.querySelector('[role="button"], button');
        if (btn) {
          const cs = window.getComputedStyle(btn);
          const text = btn.querySelector('span, div, p');
          const textCS = text ? window.getComputedStyle(text) : cs;
          return { bg: cs.backgroundColor, fg: textCS.color };
        }
        cell = cell.parentElement;
      }
      return { bg: '', fg: '' };
    });
    expect(contrast.bg).not.toBe(contrast.fg);
  });

  test('should render ContainedList with two semantic list items', async function ({ page }) {
    await page.goto('/showcase/molecules');
    const row = page.getByTestId('showcase-row-ContainedList');
    await expect(row).toBeVisible({ timeout: 10000 });

    const lists = row.locator('[role="list"]');
    await expect(lists).toHaveCount(1);

    const items = row.locator('[role="listitem"]');
    await expect(items).toHaveCount(2);

    await expect(row.getByText('First item')).toBeVisible();
    await expect(row.getByText('Second item')).toBeVisible();
  });

});
