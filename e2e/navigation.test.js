// Info: E2E tests for super-app navigation. Verifies the launcher renders,
// shape links navigate to the correct routes, and direct URL navigation works.
import { test, expect } from '@playwright/test';

test.describe('Navigation E2E', function () {

  test('launcher renders with shape links', async function ({ page }) {
    const errors = [];
    page.on('pageerror', function (e) {
      errors.push(e.message);
    });

    await page.goto('/');
    await expect(page.getByText('Nimbus')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tasks')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
    await expect(page.getByText('Carbon Components')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('click Tasks shape — navigates to /tasks', async function ({ page }) {
    await page.goto('/');
    await page.getByText('Tasks').click();
    await expect(page).toHaveURL('/tasks');
  });

  test('click Notes shape — navigates to /notes', async function ({ page }) {
    await page.goto('/');
    await page.getByText('Notes').click();
    await expect(page).toHaveURL('/notes');
  });

  test('click Carbon Components shape — navigates to /showcase', async function ({ page }) {
    await page.goto('/');
    await page.getByText('Carbon Components').click();
    await expect(page).toHaveURL('/showcase');
  });

  test('direct URL navigation to /tasks', async function ({ page }) {
    await page.goto('/tasks');
    await expect(page).toHaveURL('/tasks');
    await expect(page.getByPlaceholder('Add a task...')).toBeVisible({ timeout: 10000 });
  });

  test('direct URL navigation to /notes', async function ({ page }) {
    await page.goto('/notes');
    await expect(page).toHaveURL('/notes');
    await expect(page.getByPlaceholder('Note title')).toBeVisible({ timeout: 10000 });
  });

  test('direct URL navigation to /showcase', async function ({ page }) {
    await page.goto('/showcase');
    await expect(page).toHaveURL('/showcase');
    await expect(page.getByText('Carbon Components')).toBeVisible({ timeout: 10000 });
  });

  test('direct URL navigation to /showcase/atoms', async function ({ page }) {
    await page.goto('/showcase/atoms');
    await expect(page).toHaveURL('/showcase/atoms');
    await expect(page.getByText('Atoms')).toBeVisible({ timeout: 10000 });
  });

});
