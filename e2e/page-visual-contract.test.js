// Info: E1 - App visual-contract tests. These tests expose the defects
// that Part E fixes: Notes banner using caption02 instead of caption01,
// hardcoded color literals under src/screens/, launcher not using
// Material light, and incorrect page insets. The literal-color audit
// excludes fixtures explicitly.
import { test, expect } from '@playwright/test';


// Assert no hardcoded color literals remain in src/screens/ source.
// This runs as a static source audit, not a browser test, because the
// defect is in the source code itself. Fixtures are excluded.
test.describe('app visual contract - source audit', function () {

  test('src/screens/ has no hardcoded hex color literals (excluding fixtures)', async function () {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const screensDir = path.resolve(process.cwd(), 'src/screens');
    const violations = [];

    function scanDir (dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
              continue;
            }
            // Skip fixture files and the showcase gallery (documented fixture area)
            if (fullPath.includes('__fixture__') || fullPath.includes('__mock__') || fullPath.includes(path.sep + 'showcase' + path.sep)) {
              continue;
            }
            // Match hex color literals like #111827, #FBBF24, #E5E7EB
            const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
            if (hexMatch) {
              violations.push({
                file: path.relative(process.cwd(), fullPath),
                line: i + 1,
                match: hexMatch[0],
                text: line.trim().substring(0, 80)
              });
            }
          }
        }
      }
    }

    scanDir(screensDir);
    expect(violations).toEqual([]);
  });

});


// Assert exact computed typography for designated page elements per D4.
test.describe('app visual contract - exact typography', function () {

  test('launcher title is heading04 (28px/36px)', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const title = page.getByText('Nimbus').first();
    await expect(title).toBeVisible({ timeout: 10000 });

    const cs = await title.evaluate(function (el) {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight)
      };
    });
    expect(cs.fontSize).toBe(28);
    expect(cs.lineHeight).toBe(36);
  });

  test('launcher card title is heading02 (22px/28px)', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const cardTitle = page.getByText('Tasks').first();
    await expect(cardTitle).toBeVisible({ timeout: 10000 });

    const cs = await cardTitle.evaluate(function (el) {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight)
      };
    });
    expect(cs.fontSize).toBe(22);
    expect(cs.lineHeight).toBe(28);
  });

  test('notes banner is caption01 (12px/16px), not caption02', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/notes', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    // The banner text should be caption01 (12px/16px), not caption02 (14px/18px or larger)
    const bannerText = page.getByText(/Notes|saved locally|no backend/).first();
    await expect(bannerText).toBeVisible({ timeout: 10000 });

    const cs = await bannerText.evaluate(function (el) {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight)
      };
    });
    expect(cs.fontSize).toBe(12);
    expect(cs.lineHeight).toBe(16);
  });

  test('notes card title is heading02 (22px/28px)', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/notes', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const cardTitle = page.getByText('First note').first();
    await expect(cardTitle).toBeVisible({ timeout: 10000 });

    const cs = await cardTitle.evaluate(function (el) {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight)
      };
    });
    expect(cs.fontSize).toBe(22);
    expect(cs.lineHeight).toBe(28);
  });

  test('tasks rows are 14px/20px', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/tasks', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    // Wait for seeded tasks to render
    const taskText = page.getByText(/Welcome|Try the theme|E2E/).first();
    await expect(taskText).toBeVisible({ timeout: 10000 });

    const cs = await taskText.evaluate(function (el) {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight)
      };
    });
    expect(cs.fontSize).toBe(14);
    expect(cs.lineHeight).toBe(20);
  });

});


// Assert page insets per D4.
test.describe('app visual contract - page insets', function () {

  test('launcher has 16px horizontal inset at mobile-320', async function ({ page }) {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    // Find the scrollable content container - it has the padding
    const contentPadding = await page.evaluate(function () {
      // The content container is the ScrollView's contentContainerStyle element
      // In RNW it renders as a div with the padding/maxWidth styles
      const divs = document.querySelectorAll('div');
      for (const div of divs) {
        const cs = window.getComputedStyle(div);
        const padLeft = parseFloat(cs.paddingLeft);
        const padRight = parseFloat(cs.paddingRight);
        if (padLeft > 0 && padRight > 0 && cs.maxWidth !== 'none') {
          return { paddingLeft: padLeft, paddingRight: padRight };
        }
      }
      return null;
    });
    expect(contentPadding).not.toBeNull();
    expect(contentPadding.paddingLeft).toBe(16);
    expect(contentPadding.paddingRight).toBe(16);
  });

  test('launcher content max width is 560px', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const contentMaxWidth = await page.evaluate(function () {
      const divs = document.querySelectorAll('div');
      for (const div of divs) {
        const cs = window.getComputedStyle(div);
        const mw = parseFloat(cs.maxWidth);
        if (!isNaN(mw) && mw > 0) {
          return mw;
        }
      }
      return null;
    });
    expect(contentMaxWidth).toBe(560);
  });

  test('tasks content max width is 640px', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/tasks', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const contentMaxWidth = await page.evaluate(function () {
      const divs = document.querySelectorAll('div');
      for (const div of divs) {
        const cs = window.getComputedStyle(div);
        const mw = parseFloat(cs.maxWidth);
        if (!isNaN(mw) && mw > 0) {
          return mw;
        }
      }
      return null;
    });
    expect(contentMaxWidth).toBe(640);
  });

  test('notes content max width is 640px', async function ({ page }) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/notes', { waitUntil: 'domcontentloaded' });
    await page.evaluate(function () {
      return document.fonts.ready;
    });
    await page.waitForTimeout(500);

    const contentMaxWidth = await page.evaluate(function () {
      const divs = document.querySelectorAll('div');
      for (const div of divs) {
        const cs = window.getComputedStyle(div);
        const mw = parseFloat(cs.maxWidth);
        if (!isNaN(mw) && mw > 0) {
          return mw;
        }
      }
      return null;
    });
    expect(contentMaxWidth).toBe(640);
  });

});
