// Info: F5 - Interaction tests using real clicks, not dispatchEvent. The
// existing showcase tests used dispatchEvent to work around a Pressable hover
// detachment issue caused by the re-derive loop. Once the loop is fixed and
// the scheme option hit target covers the full visible element, real clicks
// must work. If any of these needs dispatchEvent to pass, the underlying
// defect is not fixed.
import { test, expect } from '@playwright/test';


const TASKS_ACCENT_RGB = 'rgb(79, 70, 229)';
const CARBON_ACCENT_RGB = 'rgb(15, 98, 254)';


test.describe('showcase real-click interaction', function () {

  test('should swap to the Carbon accent when the Carbon scheme option is clicked', async function ({ page }) {
    await page.goto('/showcase');
    const swatch = page.getByTestId('scheme-accent-swatch');
    await expect(swatch).toBeVisible({ timeout: 10000 });
    await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);

    // Real click, not dispatchEvent
    await page.getByTestId('scheme-option-carbon').click();
    await expect(swatch).toHaveCSS('background-color', CARBON_ACCENT_RGB);
  });

  test('should swap back to the Tasks accent when the Tasks scheme option is clicked', async function ({ page }) {
    await page.goto('/showcase');
    const swatch = page.getByTestId('scheme-accent-swatch');
    await expect(swatch).toBeVisible({ timeout: 10000 });

    // Swap to Carbon first
    await page.getByTestId('scheme-option-carbon').click();
    await expect(swatch).toHaveCSS('background-color', CARBON_ACCENT_RGB);

    // Swap back to Tasks with a real click
    await page.getByTestId('scheme-option-tasks').click();
    await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);
  });

  test('should navigate to the atoms page when the Atoms card is clicked', async function ({ page }) {
    await page.goto('/showcase');
    // Real click on the Atoms card label
    await page.getByText(/Atoms \(\d+\)/).click();
    await expect(page).toHaveURL('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible();
  });

  test('should navigate back to the showcase index from the molecules page', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByText('Molecules')).toBeVisible({ timeout: 10000 });

    // Click the "Back to showcase" link
    await page.getByText('Back to showcase').click();
    await expect(page).toHaveURL('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible();
  });

});
