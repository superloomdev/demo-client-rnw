// Info: Shared E2E helpers for page acceptance tests. Provides viewport
// definitions, readiness checks, geometry assertions, and WCAG override
// injection used by page-readiness, page-layout, page-accessibility-layout,
// and page-visual test files.
import { expect } from '@playwright/test';

// D3 viewports: exact dimensions for deterministic geometry checks.
export const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 568 },
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 720 }
];

// Routes that receive full page acceptance coverage.
export const ROUTES = ['/', '/tasks', '/notes'];


// Attach error listeners before navigation. Returns a function that
// collects any errors seen. No error is filtered by message unless
// documented and asserted as a known third-party exception.
export function attachErrorListeners (page) {
  const errors = [];

  page.on('pageerror', function (err) {
    errors.push({ type: 'pageerror', message: err.message });
  });

  page.on('console', function (msg) {
    if (msg.type() === 'error') {
      errors.push({ type: 'console.error', message: msg.text() });
    }
  });

  page.on('requestfailed', function (req) {
    errors.push({ type: 'requestfailed', message: req.url() + ' ' + req.failure().errorText });
  });

  page.on('response', function (res) {
    if (res.status() >= 400) {
      errors.push({ type: 'http-' + res.status(), message: res.url() });
    }
  });

  return function getErrors () {
    return errors;
  };
}


// Navigate to a route and assert readiness: main document response 200,
// fonts ready, nonempty visible root, and no console/page errors.
export async function assertPageReady (page, route) {
  const getErrors = attachErrorListeners(page);

  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response.status()).toBe(200);

  // Wait for fonts to be ready
  await page.evaluate(function () {
    return document.fonts.ready;
  });

  // Wait a short time for any async rendering to settle
  await page.waitForTimeout(500);

  // Assert nonempty visible root
  const rootVisible = await page.evaluate(function () {
    const root = document.getElementById('root');
    if (!root) {
      return false;
    }
    const rect = root.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  expect(rootVisible).toBe(true);

  // Assert no errors
  const errors = getErrors();
  if (errors.length > 0) {
    throw new Error('Page ' + route + ' had errors: ' + JSON.stringify(errors));
  }
}


// Assert no horizontal overflow at the current viewport.
export async function assertNoHorizontalOverflow (page) {
  const overflow = await page.evaluate(function () {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });
  expect(overflow.scrollWidth).toBe(overflow.clientWidth);
}


// Assert no visible element extends beyond viewport horizontal bounds
// (with 1px rounding tolerance for viewport boundaries).
export async function assertNoElementOverflow (page, viewportWidth) {
  const overflow = await page.evaluate(function (vw) {
    const els = document.querySelectorAll('*');
    const violations = [];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        continue;
      }
      if (rect.left < -1 || rect.right > vw + 1) {
        violations.push({
          tag: el.tagName,
          left: rect.left,
          right: rect.right,
          text: (el.textContent || '').substring(0, 40)
        });
      }
    }
    return violations;
  }, viewportWidth);
  expect(overflow).toEqual([]);
}


// Assert no pair of designated page sections overlaps. Designated sections
// are elements with data-testid="page-section-<name>".
export async function assertNoSectionOverlap (page) {
  const overlaps = await page.evaluate(function () {
    const sections = document.querySelectorAll('[data-testid^="page-section-"]');
    const rects = [];
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) {
        continue;
      }
      rects.push({
        id: sections[i].getAttribute('data-testid'),
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom
      });
    }
    const violations = [];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const intersectLeft = Math.max(a.left, b.left);
        const intersectTop = Math.max(a.top, b.top);
        const intersectRight = Math.min(a.right, b.right);
        const intersectBottom = Math.min(a.bottom, b.bottom);
        if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
          violations.push({ a: a.id, b: b.id });
        }
      }
    }
    return violations;
  });
  expect(overlaps).toEqual([]);
}


// Inject WCAG SC 1.4.12 text-spacing overrides at mobile-320.
export async function injectWcagOverrides (page) {
  await page.addStyleTag({
    content: [
      '* {',
      '  line-height: 1.5 !important;',
      '  letter-spacing: 0.12em !important;',
      '  word-spacing: 0.16em !important;',
      '}',
      'p, li {',
      '  margin-bottom: 2em !important;',
      '}'
    ].join('\n')
  });
  await page.waitForTimeout(200);
}


// Get computed font size and line height for a selector.
export async function getComputedTypography (page, selector) {
  return page.evaluate(function (sel) {
    const el = document.querySelector(sel);
    if (!el) {
      return null;
    }
    const cs = window.getComputedStyle(el);
    return {
      fontSize: parseFloat(cs.fontSize),
      lineHeight: parseFloat(cs.lineHeight)
    };
  }, selector);
}


// Assert exact computed typography for a selector.
export async function assertExactTypography (page, selector, expected) {
  const actual = await getComputedTypography(page, selector);
  expect(actual).not.toBeNull();
  expect(actual.fontSize).toBe(expected.fontSize);
  expect(actual.lineHeight).toBe(expected.lineHeight);
}
