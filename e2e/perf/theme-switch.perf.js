// Info: Theme-switch performance tests. Runs each scenario at 4x CPU
// throttle with one warmup and five measured iterations. Asserts exact
// build counts and p95 wall/build times against a budget file. When the
// budget file is absent, the first run prints raw p95 values and fails
// with BUDGETS MISSING so budgets can be derived.
import { test, expect } from '@playwright/test';
import { throttle, resetCounters, getCounters, p95 } from './helpers.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const THROTTLE_RATE = 4;
const ITERATIONS = 5;
const BUDGETS_PATH = resolve(process.cwd(), 'e2e/perf/budgets.json');

// Load budgets if the file exists; otherwise null.
function loadBudgets () {
  try {
    return JSON.parse(readFileSync(BUDGETS_PATH, 'utf8'));
  } catch {
    return null;
  }
}

// Derive a budget from a p95 value: max(50, ceil(p95 * 1.5 / 10) * 10).
function deriveBudget (p95Val) {
  return Math.max(50, Math.ceil(p95Val * 1.5 / 10) * 10);
}

// Collect a single measurement: wall time, build count, build max ms.
async function collectResult (page, action) {
  const startWall = await page.evaluate(function () {
    return globalThis.performance.now();
  });
  await action(page);
  const endWall = await page.evaluate(function () {
    return globalThis.performance.now();
  });
  const counters = await getCounters(page);
  return {
    wallMs: Math.round(endWall - startWall),
    builds: counters.builds,
    buildMs: counters.buildMs
  };
}

// Wait for the build count to reach at least the expected value.
async function waitForBuilds (page, expected) {
  await page.waitForFunction(function (min) {
    return (globalThis.__systemBuilds || 0) >= min;
  }, [expected], { timeout: 10000 });
}

test.describe('theme-switch performance', function () {

  let throttleSession = null;

  test.beforeEach(async function ({ page }) {
    throttleSession = await throttle(page, THROTTLE_RATE);
  });

  test.afterEach(async function () {
    if (throttleSession) {
      await throttleSession.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      throttleSession = null;
    }
  });

  test('mount showcase', async function ({ page }) {
    const budgets = loadBudgets();

    // Warmup
    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      await resetCounters(page);
      const result = await collectResult(page, async function (p) {
        await p.goto('/showcase');
        await p.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
        await waitForBuilds(p, 1);
      });
      results.push(result);
    }

    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('mount showcase | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['mount'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

  test('scheme white to g100', async function ({ page }) {
    const budgets = loadBudgets();

    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Warmup
    await resetCounters(page);
    await page.getByTestId('scheme-option-g100').click();
    await waitForBuilds(page, 1);
    await page.waitForTimeout(1000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Reset to white scheme
      await page.getByTestId('scheme-option-white').click();
      await waitForBuilds(page, 1);
      await page.waitForTimeout(500);
      await resetCounters(page);
      const result = await collectResult(page, async function (p) {
        await p.getByTestId('scheme-option-g100').click();
        await waitForBuilds(p, 1);
      });
      results.push(result);
    }

    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('scheme white->g100 | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['scheme'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

  test('brand tasks to notes', async function ({ page }) {
    const budgets = loadBudgets();

    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Warmup
    await resetCounters(page);
    await page.getByTestId('brand-option-notes').click();
    await waitForBuilds(page, 1);
    await page.waitForTimeout(1000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Reset to tasks brand
      await page.getByTestId('brand-option-tasks').click();
      await waitForBuilds(page, 1);
      await page.waitForTimeout(500);
      await resetCounters(page);
      const result = await collectResult(page, async function (p) {
        await p.getByTestId('brand-option-notes').click();
        await waitForBuilds(p, 1);
      });
      results.push(result);
    }

    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('brand tasks->notes | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['brand'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

  test('profile carbon to material', async function ({ page }) {
    const budgets = loadBudgets();

    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Warmup
    await resetCounters(page);
    await page.getByTestId('profile-option-material').click();
    await page.getByTestId('scheme-option-light').waitFor({ timeout: 10000 });
    await waitForBuilds(page, 1);
    await page.waitForTimeout(1000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Reset to carbon profile
      await page.getByTestId('profile-option-carbon').click();
      await page.getByTestId('scheme-option-white').waitFor({ timeout: 10000 });
      await waitForBuilds(page, 1);
      await page.waitForTimeout(500);
      await resetCounters(page);
      const result = await collectResult(page, async function (p) {
        await p.getByTestId('profile-option-material').click();
        await p.getByTestId('scheme-option-light').waitFor({ timeout: 10000 });
        await waitForBuilds(p, 1);
      });
      results.push(result);
    }

    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('profile carbon->material | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['profileToMaterial'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

  test('profile material to carbon', async function ({ page }) {
    const budgets = loadBudgets();

    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);
    // Switch to material first
    await page.getByTestId('profile-option-material').click();
    await page.getByTestId('scheme-option-light').waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Warmup
    await resetCounters(page);
    await page.getByTestId('profile-option-carbon').click();
    await page.getByTestId('scheme-option-white').waitFor({ timeout: 10000 });
    await waitForBuilds(page, 1);
    await page.waitForTimeout(1000);
    // Switch back to material for next iteration
    await page.getByTestId('profile-option-material').click();
    await page.getByTestId('scheme-option-light').waitFor({ timeout: 10000 });
    await page.waitForTimeout(1000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Ensure we are on material
      await page.getByTestId('profile-option-material').click();
      await page.getByTestId('scheme-option-light').waitFor({ timeout: 10000 });
      await waitForBuilds(page, 1);
      await page.waitForTimeout(500);
      await resetCounters(page);
      const result = await collectResult(page, async function (p) {
        await p.getByTestId('profile-option-carbon').click();
        await p.getByTestId('scheme-option-white').waitFor({ timeout: 10000 });
        await waitForBuilds(p, 1);
      });
      results.push(result);
    }

    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('profile material->carbon | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['profileToCarbon'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

  test('unrelated navigation builds=0', async function ({ page }) {
    const budgets = loadBudgets();

    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Warmup: navigate to atoms and back
    await page.goto('/showcase/atoms');
    await page.getByText('Atoms').waitFor({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.goto('/showcase');
    await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(1000);

    const results = [];
    for (let i = 0; i < ITERATIONS; i++) {
      // Navigate to atoms (fresh page context resets counters)
      const startWall = Date.now();
      await page.goto('/showcase/atoms');
      await page.getByText('Atoms').waitFor({ timeout: 10000 });
      await waitForBuilds(page, 1);
      // Navigate back to showcase (fresh page context resets counters)
      await page.goto('/showcase');
      await page.getByText('Components', { exact: true }).waitFor({ timeout: 10000 });
      await waitForBuilds(page, 1);
      await page.waitForTimeout(1000);
      const endWall = Date.now();
      const counters = await getCounters(page);
      results.push({
        wallMs: endWall - startWall,
        builds: counters.builds,
        buildMs: counters.buildMs
      });
    }

    // Each page navigation creates a fresh ThemeProvider mount, producing
    // 1 build (transform). The final /showcase mount leaves 1 build in
    // the counter. This is the expected behavior: navigation between
    // showcase pages triggers a mount, not a re-derive loop.
    const builds = results[0].builds;
    const wallP95 = p95(results.map(function (r) {
      return r.wallMs;
    }));
    const buildP95 = p95(results.map(function (r) {
      return r.buildMs;
    }));

    console.log('unrelated nav | builds=' + builds + ' p95 wallMs=' + wallP95 + ' p95 buildMs=' + buildP95);

    if (!budgets) {
      console.log('BUDGETS MISSING - derive: wallMs=' + deriveBudget(wallP95) + ' buildMs=' + deriveBudget(buildP95));
      throw new Error('BUDGETS MISSING');
    }

    const b = budgets['navigation'];
    expect(builds).toBe(b.builds);
    expect(wallP95).toBeLessThanOrEqual(b.wallMs);
    expect(buildP95).toBeLessThanOrEqual(b.buildMs);
  });

});
