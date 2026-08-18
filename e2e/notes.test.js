// Info: E2E tests for the notes app shape. Verifies page load, notes list
// rendering, and adding notes.
import { test, expect } from '@playwright/test';

test.describe('Notes E2E', function () {

  test('notes page loads without crash', async function ({ page }) {
    const errors = [];
    page.on('pageerror', function (e) {
      errors.push(e.message);
    });

    await page.goto('/notes');
    // Wait for the seeded note to load
    await expect(page.getByText('First note')).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });

  test('seeded note renders in the list', async function ({ page }) {
    await page.goto('/notes');
    await expect(page.getByText('First note')).toBeVisible({ timeout: 10000 });
  });

  test('add a note - appears in the list', async function ({ page }) {
    await page.goto('/notes');
    // Wait for the list to stabilize before interacting
    await expect(page.getByText('First note')).toBeVisible({ timeout: 10000 });

    // RNW Pressable re-renders on hover, causing element detachment.
    // Use evaluate to set input values and trigger the save button directly.
    await page.evaluate(function () {
      const titleInput = document.querySelector('input[placeholder="Note title"]');
      const bodyInput = document.querySelector('textarea[placeholder="Write something..."]') || document.querySelector('input[placeholder="Write something..."]');
      if (titleInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(titleInput, 'E2E test note');
        titleInput.dispatchEvent(new window.Event('input', { bubbles: true }));
      }
      if (bodyInput) {
        const proto = bodyInput.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(bodyInput, 'Created by Playwright');
        bodyInput.dispatchEvent(new window.Event('input', { bubbles: true }));
      }
    });
    await page.getByRole('button', { name: 'Save note' }).dispatchEvent('click');

    await expect(page.getByText('E2E test note')).toBeVisible({ timeout: 5000 });
  });

  test('back to launcher link works', async function ({ page }) {
    await page.goto('/notes');
    // Wait for the list to stabilize
    await expect(page.getByText('First note')).toBeVisible({ timeout: 10000 });
    // Use dispatchEvent to bypass detachment from RNW Pressable hover re-renders
    await page.getByText('Back to launcher').dispatchEvent('click');
    await expect(page).toHaveURL('/');
  });

});
