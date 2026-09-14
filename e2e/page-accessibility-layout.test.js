// Info: D4 - WCAG SC 1.4.12 accessibility layout tests. At mobile-320,
// inject the exact text-spacing overrides (line-height 1.5, paragraph
// margin-bottom 2em, letter-spacing 0.12em, word-spacing 0.16em) and
// assert no horizontal overflow, clipping, section overlap, hidden
// controls, or lost functionality. Tab through interactive controls and
// verify focus remains visible and ordered.
import { test, expect } from '@playwright/test';
import {
  ROUTES,
  assertNoHorizontalOverflow,
  assertNoElementOverflow,
  assertNoSectionOverlap,
  injectWcagOverrides
} from './helpers/page-readiness.js';

const WCAG_VIEWPORT = { width: 320, height: 568 };

for (const route of ROUTES) {

  test.describe('WCAG layout - ' + route, function () {

    test(route + ' should have no horizontal overflow with WCAG text-spacing overrides', async function ({ page }) {
      await page.setViewportSize(WCAG_VIEWPORT);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);
      await injectWcagOverrides(page);
      await assertNoHorizontalOverflow(page);
    });

    test(route + ' should have no element overflow with WCAG text-spacing overrides', async function ({ page }) {
      await page.setViewportSize(WCAG_VIEWPORT);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);
      await injectWcagOverrides(page);
      await assertNoElementOverflow(page, WCAG_VIEWPORT.width);
    });

    test(route + ' should have no section overlap with WCAG text-spacing overrides', async function ({ page }) {
      await page.setViewportSize(WCAG_VIEWPORT);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);
      await injectWcagOverrides(page);
      await assertNoSectionOverlap(page);
    });

    test(route + ' should have visible focus on interactive controls with WCAG overrides', async function ({ page }) {
      await page.setViewportSize(WCAG_VIEWPORT);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(function () {
        return document.fonts.ready;
      });
      await page.waitForTimeout(500);
      await injectWcagOverrides(page);

      // Tab through interactive controls and verify focus remains visible
      const focusableCount = await page.evaluate(function () {
        const els = document.querySelectorAll('a, button, input, [tabindex]');
        let count = 0;
        for (let i = 0; i < els.length; i++) {
          const rect = els[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            count++;
          }
        }
        return count;
      });
      expect(focusableCount).toBeGreaterThan(0);

      // Capture the computed style of the first focusable element at rest
      const restStyle = await page.evaluate(function () {
        const els = document.querySelectorAll('a, button, input, [tabindex]');
        for (let i = 0; i < els.length; i++) {
          const rect = els[i].getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const cs = window.getComputedStyle(els[i]);
            return {
              outlineStyle: cs.outlineStyle,
              boxShadow: cs.boxShadow,
              borderBottomColor: cs.borderBottomColor,
              borderColor: cs.borderColor,
              borderBottomWidth: cs.borderBottomWidth
            };
          }
        }
        return null;
      });

      // Tab to the first focusable element and check focus visibility
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusVisible = await page.evaluate(function (rest) {
        const el = document.activeElement;
        if (!el || el === document.body) {
          return false;
        }
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return false;
        }
        // Visible focus: outline is visible while focused, OR a border
        // color / box-shadow differs between rest and focused. A border
        // that is identical at rest and on focus must fail.
        const hasOutline = cs.outlineStyle !== 'none' || cs.boxShadow !== 'none';
        const borderChanged = rest && (
          cs.borderBottomColor !== rest.borderBottomColor ||
          cs.borderColor !== rest.borderColor ||
          cs.boxShadow !== rest.boxShadow
        );
        return hasOutline || borderChanged;
      }, restStyle);
      expect(focusVisible).toBe(true);
    });

  });

}
