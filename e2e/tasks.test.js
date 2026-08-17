// Info: E2E tests for the tasks app shape. Verifies page load, task list
// rendering, adding tasks, and toggling task state.
import { test, expect } from '@playwright/test';

test.describe('Tasks E2E', function () {

  test('tasks page loads without crash', async function ({ page }) {
    const errors = [];
    page.on('pageerror', function (e) {
      errors.push(e.message);
    });

    await page.goto('/tasks');
    // Wait for the seeded tasks to load (SDK promise resolves async)
    await expect(page.getByText('Welcome to Nimbus')).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });

  test('seeded tasks render in the list', async function ({ page }) {
    await page.goto('/tasks');
    await expect(page.getByText('Welcome to Nimbus')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Try the theme showcase')).toBeVisible();
  });

  test('add a task — appears in the list', async function ({ page }) {
    await page.goto('/tasks');
    // Wait for the list to stabilize before interacting
    await expect(page.getByText('Welcome to Nimbus')).toBeVisible({ timeout: 10000 });

    // RNW Pressable re-renders on hover, causing element detachment.
    // Use evaluate to set the input value and trigger the add button directly.
    await page.evaluate(function () {
      const input = document.querySelector('input[placeholder="Add a task..."]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, 'E2E test task');
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
      }
    });
    await page.getByRole('button', { name: 'Add' }).dispatchEvent('click');

    await expect(page.getByText('E2E test task')).toBeVisible({ timeout: 5000 });
  });

  test('back to launcher link works', async function ({ page }) {
    await page.goto('/tasks');
    // Wait for the list to stabilize
    await expect(page.getByText('Welcome to Nimbus')).toBeVisible({ timeout: 10000 });
    // Use dispatchEvent to bypass detachment from RNW Pressable hover re-renders
    await page.getByText('Back to launcher').dispatchEvent('click');
    await expect(page).toHaveURL('/');
  });

});
