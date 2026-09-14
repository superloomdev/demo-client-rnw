// Info: Showcase and app fidelity test (Plan 0156, Part L, R10-R12).
// Asserts three rendering contracts on the launcher, the two app shapes,
// and the showcase galleries: (a) no leaf text node renders in the user
// agent default serif, which happens when a raw string is passed to a
// layout slot instead of a Text element; (b) no icon renders the '?'
// fallback glyph, which means a semantic name is missing from the icon
// manifest; (c) every visible button or tab is at least 24x24 and every
// field-adjacent control is at least textInput.controlSize square.
import { test, expect } from '@playwright/test';
import spec from '../hosts/web/node_modules/@superloomdev/rnw-components/data/component-spec.js';

// controlSize comes from the published spec sheet; the assertion below
// fails loudly while the installed package predates the key
const controlSize = spec && spec.textInput ? spec.textInput.controlSize : undefined;

const ROUTES = [
  { route: '/', ready: 'Nimbus' },
  { route: '/tasks', ready: 'Track things you need to do.' },
  { route: '/notes', ready: 'First note' },
  { route: '/showcase/atoms', ready: 'Atoms' },
  { route: '/showcase/molecules', ready: 'Molecules' },
  { route: '/showcase/composites', ready: 'Composites' }
];

const CONTROL_LABELS = [
  'Show password',
  'Hide password',
  'Clear search',
  'Increment',
  'Decrement',
  'Open date picker'
];

// Collect trimmed text of visible leaf text nodes whose computed
// font-family is the user agent default (serif) rather than a theme font
function collectSerifTextNodes () {
  const found = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }
    const family = style.fontFamily || '';
    if (!/times|serif/i.test(family) || /sans/i.test(family)) {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) {
          found.push(text);
        }
      }
    }
  }
  return Array.from(new Set(found));
}

// Collect elements whose entire content is the icon fallback glyph
function collectFallbackGlyphs () {
  const found = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    if (el.children.length !== 0) {
      continue;
    }
    if ((el.textContent || '').trim() !== '?') {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) {
      continue;
    }
    found.push(el.tagName.toLowerCase() + ' ' + Math.round(rect.width) + 'x' + Math.round(rect.height));
  }
  return found;
}

// Collect visible buttons/tabs below 24x24 and field-adjacent controls
// below the spec control size. Takes one arg so page.evaluate can
// serialize the whole function into the page.
function collectUndersizedControls (arg) {
  const labels = arg.labels;
  const minControl = arg.minControl;
  const found = [];
  const all = document.querySelectorAll('button, [role="button"], [role="tab"], [aria-label]');
  for (const el of all) {
    const label = el.getAttribute('aria-label');
    const isFieldControl = label && labels.indexOf(label) >= 0;
    const isClickable = el.matches('button, [role="button"], [role="tab"]');
    if (!isFieldControl && !isClickable) {
      continue;
    }
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) {
      continue;
    }
    const min = isFieldControl ? minControl : 24;
    if (rect.width < min || rect.height < min) {
      const name = label || (el.textContent || '').trim().substring(0, 40) || el.tagName.toLowerCase();
      found.push(name + ' ' + Math.round(rect.width) + 'x' + Math.round(rect.height));
    }
  }
  return found;
}

// Collect visible buttons/tabs/links with no accessible name
function collectUnnamedControls () {
  const found = [];
  const all = document.querySelectorAll('button, [role="button"], [role="tab"], [role="link"]');
  for (const el of all) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) {
      continue;
    }
    // Resolve accessible name: aria-label, aria-labelledby target text,
    // trimmed textContent, contained img alt, or title attribute
    let name = el.getAttribute('aria-label');
    if (!name) {
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const ref = document.getElementById(labelledby);
        if (ref) {
          name = (ref.textContent || '').trim();
        }
      }
    }
    if (!name) {
      name = (el.textContent || '').trim();
    }
    if (!name) {
      const img = el.querySelector('img');
      if (img) {
        name = (img.getAttribute('alt') || '').trim();
      }
    }
    if (!name) {
      name = el.getAttribute('title');
    }
    if (!name) {
      const cls = (el.className || '').toString().substring(0, 40);
      found.push(el.tagName.toLowerCase() + ' ' + Math.round(rect.width) + 'x' + Math.round(rect.height) + ' class=' + cls);
    }
  }
  return found;
}

test.describe('showcase fidelity', function () {

  for (const entry of ROUTES) {

    test(entry.route + ' has themed text, resolved icons, and reachable controls', async function ({ page }) {

      expect(typeof controlSize, 'textInput.controlSize must be a number in data/component-spec.js').toBe('number');

      await page.goto(entry.route, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(entry.ready).first()).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000);

      // (a) zero leaf text nodes in the user agent default serif
      const serifTexts = await page.evaluate(collectSerifTextNodes);
      expect(serifTexts, 'unthemed serif text nodes on ' + entry.route).toEqual([]);

      // (b) zero icon fallback glyphs
      const fallbacks = await page.evaluate(collectFallbackGlyphs);
      expect(fallbacks, 'unmapped icon fallback glyphs on ' + entry.route).toEqual([]);

      // (c) controls meet the minimum target size
      const undersized = await page.evaluate(collectUndersizedControls, { labels: CONTROL_LABELS, minControl: controlSize });
      expect(undersized, 'undersized controls on ' + entry.route).toEqual([]);

      // (d) every visible button/tab/link has a non-empty accessible name
      const unnamed = await page.evaluate(collectUnnamedControls);
      expect(unnamed, 'unnamed controls on ' + entry.route).toEqual([]);
    });

  }

});
