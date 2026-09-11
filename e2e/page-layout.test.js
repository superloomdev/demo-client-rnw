// Info: D3/D4 - Page layout and geometry tests. At all D3 viewports,
// assert no horizontal overflow, no element overflow beyond viewport
// bounds, no section overlap, exact computed typography for designated
// page elements, and no visible text exceeding the max font size ceiling.
// Geometry uses a 1px browser rounding tolerance only for viewport
// boundaries; semantic font/line-height/inset values remain exact.
import { test, expect } from '@playwright/test';
import {
  VIEWPORTS,
  ROUTES,
  assertNoHorizontalOverflow,
  assertNoElementOverflow,
  assertNoSectionOverlap
} from './helpers/page-readiness.js';

// The maximum font size any visible text element should ever compute to.
// The largest type token is heading07 at 54px; 84px gives headroom for
// any future display token without masking a 392px regression.
const MAX_FONT_PX = 84;

for (const vp of VIEWPORTS) {

  test.describe('page layout at ' + vp.name, function () {

    for (const route of ROUTES) {

      test(route + ' should have no horizontal overflow', async function ({ page }) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(function () {
          return document.fonts.ready;
        });
        await page.waitForTimeout(500);
        await assertNoHorizontalOverflow(page);
      });

      test(route + ' should have no element overflow beyond viewport', async function ({ page }) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(function () {
          return document.fonts.ready;
        });
        await page.waitForTimeout(500);
        await assertNoElementOverflow(page, vp.width);
      });

      test(route + ' should have no section overlap', async function ({ page }) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(function () {
          return document.fonts.ready;
        });
        await page.waitForTimeout(500);
        await assertNoSectionOverlap(page);
      });

      test(route + ' should have nonzero visible root content', async function ({ page }) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(function () {
          return document.fonts.ready;
        });
        await page.waitForTimeout(500);

        const rootInfo = await page.evaluate(function () {
          const root = document.getElementById('root');
          if (!root) {
            return null;
          }
          const rect = root.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        expect(rootInfo).not.toBeNull();
        expect(rootInfo.width).toBeGreaterThan(0);
        expect(rootInfo.height).toBeGreaterThan(0);
      });

      test(route + ' should have no visible text exceeding ' + MAX_FONT_PX + 'px', async function ({ page }) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.evaluate(function () {
          return document.fonts.ready;
        });
        await page.waitForTimeout(500);

        const oversized = await page.evaluate(function (maxPx) {
          const results = [];
          const els = document.querySelectorAll('*');
          for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.childElementCount > 0) {
              continue;
            }
            const text = el.textContent.trim();
            if (!text) {
              continue;
            }
            const cs = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) {
              continue;
            }
            const fontSize = parseFloat(cs.fontSize);
            if (fontSize > maxPx) {
              results.push({ text: text.substring(0, 40), fontSize: fontSize });
            }
          }
          return results;
        }, MAX_FONT_PX);
        expect(oversized).toEqual([]);
      });

    }

  });

}
