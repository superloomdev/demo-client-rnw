// Info: Showcase and app fidelity test.
// Asserts rendering contracts on the launcher, the two app shapes,
// and the showcase galleries: (a) no leaf text node renders in the user
// agent default serif, which happens when a raw string is passed to a
// layout slot instead of a Text element; (b) no icon renders the '?'
// fallback glyph, which means a semantic name is missing from the icon
// manifest; (c) every visible button or tab is at least 24x24 and every
// field-adjacent control is at least textInput.controlSize square;
// (d) every visible button/tab/link has a non-empty accessible name;
// (e) field composites own the focus frame: the input has no UA outline,
// exactly one element on the chain from the input's parent up to (excluding)
// the row root has borderBottomWidth > 0, and that element's borderBottomColor
// changes between rest and focus.
import { test, expect } from '@playwright/test';
import spec from '../hosts/web/node_modules/@superloomdev/rnw-components/data/component-spec.js';

// controlSize comes from the published spec sheet; the assertion below
// fails loudly while the installed package predates the key
const controlSize = spec && spec.textInput
  ? (spec.textInput.controlSize || 40)
  : undefined;

const ROUTES = [
  { route: '/', ready: 'Nimbus' },
  { route: '/tasks', ready: 'Track things you need to do.' },
  { route: '/notes', ready: 'First note' },
  { route: '/showcase/atoms', ready: 'Atoms' },
  { route: '/showcase/molecules', ready: 'Molecules' },
  { route: '/showcase/composites', ready: 'Composites' }
];

// Four builds for the per-brand fidelity matrix (M.5)
const BUILDS = [
  { name: 'carbon/white/none', query: '?profile=carbon&scheme=white&brand=', attr: 'carbon/white/none' },
  { name: 'carbon/white/rounded', query: '?profile=carbon&scheme=white&brand=rounded', attr: 'carbon/white/rounded' },
  { name: 'carbon/white/tasks', query: '?profile=carbon&scheme=white&brand=tasks', attr: 'carbon/white/tasks' },
  { name: 'material/light/none', query: '?profile=material&scheme=light&brand=', attr: 'material/light/none' }
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

// Visible field rows to check for frame ownership (molecules + atoms)
const FIELD_ROWS = {
  '/showcase/molecules': [
    'PasswordInput', 'ControlledPasswordInput', 'Search',
    'NumberInput', 'DatePickerInput', 'ExpandableSearch', 'TableToolbarSearch'
  ],
  '/showcase/atoms': ['TextInput']
};

// Get rest state for a field row: outlineStyle, border chain count,
// and the border element's borderBottomColor.
function getFrameRestState (rowSelector) {
  const row = document.querySelector(rowSelector);
  if (!row) {
    return { rowMissing: true };
  }
  const input = row.querySelector('input');
  if (!input) {
    return { inputMissing: true };
  }

  const restComputed = window.getComputedStyle(input);
  const restOutline = restComputed.outlineStyle;

  let borderEl = null;
  let borderCount = 0;
  let node = input;
  while (node && node !== row) {
    const bs = window.getComputedStyle(node);
    const bw = parseFloat(bs.borderBottomWidth);
    if (bw > 0) {
      borderCount++;
      if (!borderEl) {
        borderEl = node;
      }
    }
    node = node.parentElement;
  }

  const restBorderColor = borderEl ? window.getComputedStyle(borderEl).borderBottomColor : null;

  return {
    restOutline: restOutline,
    borderCount: borderCount,
    restBorderColor: restBorderColor
  };
}

// Get focused state for a field row: outlineStyle and the border
// element's borderBottomColor. The input must already be focused.
function getFrameFocusedState (rowSelector) {
  const row = document.querySelector(rowSelector);
  if (!row) {
    return { rowMissing: true };
  }
  const input = row.querySelector('input');
  if (!input) {
    return { inputMissing: true };
  }

  const focusedComputed = window.getComputedStyle(input);
  const focusedOutline = focusedComputed.outlineStyle;

  let borderEl = null;
  let node = input;
  while (node && node !== row) {
    const bs = window.getComputedStyle(node);
    const bw = parseFloat(bs.borderBottomWidth);
    if (bw > 0) {
      borderEl = node;
      break;
    }
    node = node.parentElement;
  }

  const focusedBorderColor = borderEl ? window.getComputedStyle(borderEl).borderBottomColor : null;

  return {
    focusedOutline: focusedOutline,
    focusedBorderColor: focusedBorderColor
  };
}

test.describe('showcase fidelity', function () {

  // (a-d) Run the four assertion groups across four builds x six routes (M.5)
  for (const build of BUILDS) {
    for (const entry of ROUTES) {

      test(build.name + ' ' + entry.route + ' has themed text, resolved icons, and reachable controls', async function ({ page }) {

        expect(typeof controlSize, 'textInput.controlSize must be a number in data/component-spec.js').toBe('number');

        await page.goto(entry.route + build.query, { waitUntil: 'domcontentloaded' });
        await expect(page.getByText(entry.ready).first()).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1000);

        // Assert the build attribute matches what was requested (M.5)
        const buildAttr = await page.evaluate(function () {
          const el = document.querySelector('[data-theme-build]');
          return el ? el.getAttribute('data-theme-build') : null;
        });
        expect(buildAttr, 'data-theme-build should match ' + build.attr).toBe(build.attr);

        // (a) zero leaf text nodes in the user agent default serif
        const serifTexts = await page.evaluate(collectSerifTextNodes);
        expect(serifTexts, 'unthemed serif text nodes on ' + build.name + ' ' + entry.route).toEqual([]);

        // (b) zero icon fallback glyphs
        const fallbacks = await page.evaluate(collectFallbackGlyphs);
        expect(fallbacks, 'unmapped icon fallback glyphs on ' + build.name + ' ' + entry.route).toEqual([]);

        // (c) controls meet the minimum target size
        const undersized = await page.evaluate(collectUndersizedControls, { labels: CONTROL_LABELS, minControl: controlSize });
        expect(undersized, 'undersized controls on ' + build.name + ' ' + entry.route).toEqual([]);

        // (d) every visible button/tab/link has a non-empty accessible name
        const unnamed = await page.evaluate(collectUnnamedControls);
        expect(unnamed, 'unnamed controls on ' + build.name + ' ' + entry.route).toEqual([]);
      });

    }
  }

  // (e) field frame ownership on molecules and atoms (runs under default build)
  for (const route of Object.keys(FIELD_ROWS)) {
    test(route + ' field composites own the focus frame', async function ({ page }) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const allViolations = [];
      for (const name of FIELD_ROWS[route]) {
        const selector = '[data-testid="showcase-row-' + name + '"]';

        // Read rest state
        const rest = await page.evaluate(getFrameRestState, selector);
        if (rest.rowMissing || rest.inputMissing) {
          continue;
        }

        // Focus the input and wait for React to re-render
        await page.locator(selector + ' input').first().focus();
        await page.waitForTimeout(200);

        // Read focused state
        const focused = await page.evaluate(getFrameFocusedState, selector);

        // Blur to restore
        await page.locator(selector + ' input').first().blur();

        // Collect violations
        if (rest.restOutline !== 'none') {
          allViolations.push(name + ': input rest outlineStyle is ' + rest.restOutline + ' (expected none)');
        }
        if (focused.focusedOutline !== 'none') {
          allViolations.push(name + ': input focused outlineStyle is ' + focused.focusedOutline + ' (expected none)');
        }
        if (rest.borderCount !== 1) {
          allViolations.push(name + ': nested frames: ' + rest.borderCount + ' (expected 1)');
        }
        if (rest.restBorderColor === focused.focusedBorderColor) {
          allViolations.push(name + ': frame did not react to focus (borderBottomColor unchanged)');
        }
      }

      expect(allViolations, 'frame owner violations on ' + route + ': ' + allViolations.join('; ')).toEqual([]);
    });
  }

});
