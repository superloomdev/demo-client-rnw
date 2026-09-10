// Info: Performance measurement helpers for the perf project. Provides
// CDP CPU throttling, counter reset, and a measure() function that
// captures wall-clock time, build count, and build timing for a single
// theme-switch action.

// Apply CDP CPU throttling at the given rate (e.g. 4 for 4x slowdown).
// Returns the CDPSession so the caller can reset throttling later.
async function throttle (page, rate) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: rate });
  return session;
}

// Reset the global build counters so the next measurement starts clean.
async function resetCounters (page) {
  await page.evaluate(function () {
    globalThis.__systemBuilds = 0;
    globalThis.__themePerf = [];
  });
}

// Get the current build count and max build duration.
async function getCounters (page) {
  return page.evaluate(function () {
    const perf = globalThis.__themePerf || [];
    const maxMs = perf.length > 0
      ? Math.max.apply(null, perf.map(function (e) {
        return e.ms;
      }))
      : 0;
    return {
      builds: globalThis.__systemBuilds || 0,
      buildMs: maxMs
    };
  });
}

// Compute the p95 of an array of numbers.
function p95 (values) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = values.slice().sort(function (a, b) {
    return a - b;
  });
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

export { throttle, resetCounters, getCounters, p95 };
