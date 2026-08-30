// Info: E2E tests for the showcase app shape. Verifies that every
// gallery page loads without crashes and renders component content.
import { test, expect } from '@playwright/test';

// A11yInspector is excluded from the web host (requires react-test-renderer)
const SHOWCASE_PAGES = [
  { path: '/showcase', title: 'Carbon Components' },
  { path: '/showcase/atoms', title: 'Atoms' },
  { path: '/showcase/molecules', title: 'Molecules' },
  { path: '/showcase/composites', title: 'Composites' },
  { path: '/showcase/providers', title: 'Providers' },
  { path: '/showcase/parity', title: 'Carbon Parity' }
];

test.describe('Showcase E2E', function () {

  test('showcase index loads with component counts', async function ({ page }) {
    const errors = [];
    page.on('pageerror', function (e) {
      errors.push(e.message);
    });

    await page.goto('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible();
    // The summary card shows "N components" with a live count
    await expect(page.getByText(/(\d+) components/)).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });

  for (const p of SHOWCASE_PAGES) {
    test('showcase page ' + p.path + ' loads without crash', async function ({ page }) {
      const errors = [];
      page.on('pageerror', function (e) {
        errors.push(e.message);
      });

      await page.goto(p.path);
      await expect(page.getByText(p.title)).toBeVisible({ timeout: 10000 });

      expect(errors).toEqual([]);
    });
  }

  test('atoms gallery renders component rows', async function ({ page }) {
    await page.goto('/showcase/atoms');
    // Button is a known atom; use exact match to avoid RadioButton collision
    await expect(page.getByText('Button', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('molecules gallery renders component rows', async function ({ page }) {
    await page.goto('/showcase/molecules');
    await expect(page.getByText('Molecules')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('InlineNotification')).toBeVisible();
  });

  test('composites gallery renders component rows', async function ({ page }) {
    await page.goto('/showcase/composites');
    await expect(page.getByText('Composites')).toBeVisible({ timeout: 10000 });
  });

  test('showcase navigation: index to atoms and back', async function ({ page }) {
    await page.goto('/showcase');
    // Click the "Atoms (N)" card label, not the summary text
    // Use dispatchEvent to bypass detachment from RNW Pressable hover re-renders
    await page.getByText(/Atoms \(\d+\)/).dispatchEvent('click');
    await expect(page).toHaveURL('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible();
  });

});


// ========================= SCHEME SELECTOR ================================= //

test('showcase has a scheme selector with Tasks and Carbon options', async function ({ page }) {
  await page.goto('/showcase');
  await expect(page.getByText('Scheme')).toBeVisible({ timeout: 10000 });
  // The scheme selector buttons are inside the Scheme card
  const schemeCard = page.locator('text=Scheme').locator('..');
  await expect(schemeCard.getByText('Tasks')).toBeVisible();
  await expect(schemeCard.getByText('Carbon')).toBeVisible();
});

// Carbon Blue 60 (#0f62fe) and the tasks indigo (#4f46e5) as rgb(), which is
// what getComputedStyle returns. The swatch renders APP_PRIMARY, so these are
// the exact values it must carry before and after the swap.
const TASKS_ACCENT_RGB = 'rgb(79, 70, 229)';
const CARBON_ACCENT_RGB = 'rgb(15, 98, 254)';

test('scheme selector swaps APP_PRIMARY to Carbon Blue 60', async function ({ page }) {
  const errors = [];
  page.on('pageerror', function (e) {
    errors.push(e.message);
  });

  await page.goto('/showcase');
  const swatch = page.getByTestId('scheme-accent-swatch');
  await expect(swatch).toBeVisible({ timeout: 10000 });

  // The showcase mounts under the tasks scheme, so the accent starts indigo
  await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);

  // The selector uses RNW Pressable, which detaches on hover re-render.
  // dispatchEvent bypasses the detachment, matching the pattern used by the
  // showcase navigation test above.
  await page.getByTestId('scheme-option-carbon').dispatchEvent('click');

  // toHaveCSS retries until the re-derive lands, so no fixed wait is needed
  await expect(swatch).toHaveCSS('background-color', CARBON_ACCENT_RGB);

  expect(errors).toEqual([]);
});

test('scheme selector swaps back to the tasks accent', async function ({ page }) {
  await page.goto('/showcase');
  const swatch = page.getByTestId('scheme-accent-swatch');
  await expect(swatch).toBeVisible({ timeout: 10000 });

  await page.getByTestId('scheme-option-carbon').dispatchEvent('click');
  await expect(swatch).toHaveCSS('background-color', CARBON_ACCENT_RGB);

  // Swapping back proves updateScheme replaces the base rather than
  // accumulating layers, which would leave the Carbon accent in place
  await page.getByTestId('scheme-option-tasks').dispatchEvent('click');
  await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);
});
