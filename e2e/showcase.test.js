// Info: E2E tests for the showcase app shape. Verifies that every
// gallery page loads without crashes and renders component content.
import { test, expect } from '@playwright/test';

// A11yInspector is excluded from the web host (requires react-test-renderer)
const SHOWCASE_PAGES = [
  { path: '/showcase', title: 'Components' },
  { path: '/showcase/atoms', title: 'Atoms' },
  { path: '/showcase/molecules', title: 'Molecules' },
  { path: '/showcase/composites', title: 'Composites' },
  { path: '/showcase/providers', title: 'Providers' },
  { path: '/showcase/parity', title: 'Parity' }
];

test.describe('Showcase E2E', function () {

  test('showcase index loads with component counts', async function ({ page }) {
    const errors = [];
    page.on('pageerror', function (e) {
      errors.push(e.message);
    });

    await page.goto('/showcase');
    await expect(page.getByText('Components', { exact: true })).toBeVisible();
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
      // Use exact match for /showcase (conflicts with "N components"), loose for others
      if (p.path === '/showcase') {
        await expect(page.getByText(p.title, { exact: true })).toBeVisible({ timeout: 10000 });
      } else {
        await expect(page.getByText(p.title)).toBeVisible({ timeout: 10000 });
      }

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
    await page.getByText(/Atoms \(\d+\)/).click();
    await expect(page).toHaveURL('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible();
  });

});


// ========================= PROFILE SELECTOR ================================= //

test('showcase has a profile selector with Carbon and Material options', async function ({ page }) {
  await page.goto('/showcase');
  await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('profile-option-carbon')).toBeVisible();
  await expect(page.getByTestId('profile-option-material')).toBeVisible();
});

test('showcase has scheme and brand selectors', async function ({ page }) {
  await page.goto('/showcase');
  await expect(page.getByText('Scheme')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Brand')).toBeVisible();
  await expect(page.getByTestId('scheme-option-white')).toBeVisible();
  await expect(page.getByTestId('brand-option-tasks')).toBeVisible();
  await expect(page.getByTestId('brand-option-notes')).toBeVisible();
});

// Carbon Blue 60 (#0f62fe) and the tasks indigo (#4f46e5) as rgb(), which is
// what getComputedStyle returns. The swatch renders color.interactive, so
// these are the exact values it must carry before and after the swap.
const TASKS_ACCENT_RGB = 'rgb(79, 70, 229)';
const CARBON_WHITE_ACCENT_RGB = 'rgb(15, 98, 254)';

test('scheme selector swaps accent to Carbon White when clicked', async function ({ page }) {
  const errors = [];
  page.on('pageerror', function (e) {
    errors.push(e.message);
  });

  await page.goto('/showcase');
  const swatch = page.getByTestId('scheme-accent-swatch');
  await expect(swatch).toBeVisible({ timeout: 10000 });

  // The showcase mounts under the tasks brand, so the accent starts indigo
  await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);

  // Real click - the Pressable hover detachment was fixed by the scheme
  // option hit target fix (E2) and the re-derive loop fix (C1)
  await page.getByTestId('scheme-option-white').click();

  // toHaveCSS retries until the re-derive lands, so no fixed wait is needed
  await expect(swatch).toHaveCSS('background-color', CARBON_WHITE_ACCENT_RGB);

  expect(errors).toEqual([]);
});

test('scheme selector swaps back to the tasks accent', async function ({ page }) {
  await page.goto('/showcase');
  const swatch = page.getByTestId('scheme-accent-swatch');
  await expect(swatch).toBeVisible({ timeout: 10000 });

  await page.getByTestId('scheme-option-white').click();
  await expect(swatch).toHaveCSS('background-color', CARBON_WHITE_ACCENT_RGB);

  // Swapping back proves updateBrand replaces the brand rather than
  // accumulating layers, which would leave the Carbon accent in place
  await page.getByTestId('brand-option-tasks').click();
  await expect(swatch).toHaveCSS('background-color', TASKS_ACCENT_RGB);
});

// ========================= MATERIAL PROFILE ================================= //

test('switching to Material profile changes available schemes', async function ({ page }) {
  const errors = [];
  page.on('pageerror', function (e) {
    errors.push(e.message);
  });

  await page.goto('/showcase');
  await expect(page.getByTestId('profile-option-material')).toBeVisible({ timeout: 10000 });

  // Click Material profile
  await page.getByTestId('profile-option-material').click();

  // Material has Light and Dark schemes (not White, g10, g90, g100)
  await expect(page.getByTestId('scheme-option-light')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('scheme-option-dark')).toBeVisible();

  expect(errors).toEqual([]);
});

test('Material profile renders without crash', async function ({ page }) {
  const errors = [];
  page.on('pageerror', function (e) {
    errors.push(e.message);
  });

  await page.goto('/showcase');
  await page.getByTestId('profile-option-material').click();
  await expect(page.getByTestId('scheme-option-light')).toBeVisible({ timeout: 10000 });

  // The swatch should still be visible and have a valid color
  const swatch = page.getByTestId('scheme-accent-swatch');
  await expect(swatch).toBeVisible();
  const bgColor = await swatch.evaluate(function (el) {
    return window.getComputedStyle(el).backgroundColor;
  });
  expect(bgColor).toMatch(/rgb\(/);

  expect(errors).toEqual([]);
});

test('switching back to Carbon profile restores Carbon schemes', async function ({ page }) {
  const errors = [];
  page.on('pageerror', function (e) {
    errors.push(e.message);
  });

  await page.goto('/showcase');

  // Switch to Material
  await page.getByTestId('profile-option-material').click();
  await expect(page.getByTestId('scheme-option-light')).toBeVisible({ timeout: 10000 });

  // Switch back to Carbon
  await page.getByTestId('profile-option-carbon').click();
  await expect(page.getByTestId('scheme-option-white')).toBeVisible({ timeout: 10000 });

  expect(errors).toEqual([]);
});
