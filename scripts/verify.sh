#!/usr/bin/env bash
# Info: Local CI parity gate. Runs every check .github/workflows/ci.yml runs,
# in the same order, so a push never discovers a failure the workstation could
# have reported in seconds.
#
# The grep gates (G25, G26) are extracted from the workflow YAML at runtime by
# scripts/verify-gates.js, so they can never drift from the workflow source.
#
# Usage:
#   bash scripts/verify.sh          full parity, including builds and e2e
#   bash scripts/verify.sh --fast   skips the host builds and Playwright

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

FAST=0
if [ "${1:-}" = "--fast" ]; then
  FAST=1
fi

FAILED=""
PASSED=0

# Run one named gate, record the outcome, and keep going so a single failure
# does not hide the rest. CI reports every job, so this must too.
run_gate () {
  local name="$1"
  shift
  printf '\n\033[1m=== %s ===\033[0m\n' "$name"
  if "$@"; then
    printf '\033[32mPASS\033[0m %s\n' "$name"
    PASSED=$((PASSED + 1))
  else
    printf '\033[31mFAIL\033[0m %s\n' "$name"
    FAILED="${FAILED}  - ${name}"$'\n'
  fi
}


# --------------------------- Gate: portability ---------------------------- #

gate_portability () {
  bash scripts/check-portability.sh
}


# --------------------------- Gate: root install --------------------------- #
# CI runs npm ci at the repo root before lint and Playwright. A clean checkout
# must have the root dev dependencies that both require.

gate_root_install () {
  npm ci
}


# ------------------------------ Gate: eslint ------------------------------ #

gate_eslint () {
  npx eslint .
}


# ---------------------------- Gate: unit tests ---------------------------- #

gate_unit () {
  (cd src/_test && npm ci --silent && npm test)
}


# ---------------------------- Gate: web build ----------------------------- #

gate_web_build () {
  (cd hosts/web && npm ci --silent && npx vite build)
}


# ---------------------------- Gate: expo web ------------------------------ #

gate_expo_web () {
  (cd hosts/expo && npm ci --silent && npx expo export --platform web --output-dir dist)
}


# ------------------------------- Gate: e2e -------------------------------- #

gate_e2e () {
  npx playwright test --project=chromium
}


# ------------------------------- Gate: perf -------------------------------- #

gate_perf () {
  npx playwright test --project=perf
}


# ------------------------------ Gate: visual ------------------------------- #
# The visual gate runs the serial visual project inside the pinned Playwright
# Docker image so local and CI baselines are the same platform. If Docker is
# unavailable the gate reports FAIL external-failure: docker required for
# visual gate. The spec file is created in Part F; until then the project
# reports no tests found, which is a pass.

gate_visual () {
  # If no spec files exist yet, the visual project reports no tests found.
  # This is a pass, not a skip: the gate is wired and listed, and will run
  # real baselines once Part F adds the spec file.
  local spec_count
  spec_count=$(find "$REPO_ROOT/e2e/visual" -type f \( -name '*.test.js' -o -name '*.spec.js' \) 2>/dev/null | wc -l | tr -d ' ')
  if [ "$spec_count" -eq 0 ]; then
    printf '\033[33mno tests found\033[0m (visual project wired, spec file pending Part F)\n'
    return 0
  fi

  local pw_version
  pw_version=$(node -e "process.stdout.write(require('./node_modules/@playwright/test/package.json').version)")
  local image="mcr.microsoft.com/playwright:v${pw_version}-noble"
  if ! command -v docker >/dev/null 2>&1; then
    printf '\033[31mFAIL external-failure: docker required for visual gate\033[0m\n'
    return 1
  fi
  if ! docker info >/dev/null 2>&1; then
    printf '\033[31mFAIL external-failure: docker daemon not running for visual gate\033[0m\n'
    return 1
  fi
  docker run --rm \
    -v "$REPO_ROOT:/work" \
    -w /work \
    --network host \
    "$image" \
    npx playwright test --project=visual
}


# ------------------------------- Run gates -------------------------------- #

run_gate 'portability fence' gate_portability
run_gate 'root install' gate_root_install
run_gate 'workflow policy gates' node scripts/verify-gates.js --gates
run_gate 'eslint' gate_eslint
run_gate 'unit tests (src/_test)' gate_unit

if [ "$FAST" = "0" ]; then
  run_gate 'vite web build' gate_web_build
  run_gate 'expo web export' gate_expo_web
  run_gate 'playwright e2e' gate_e2e
  run_gate 'playwright perf' gate_perf
  run_gate 'playwright visual' gate_visual
else
  printf '\n\033[33mSKIPPED\033[0m builds and e2e (--fast)\n'
fi


# ------------------------------- Summary ---------------------------------- #

printf '\n\033[1m=== Summary ===\033[0m\n'
printf 'passed: %s\n' "$PASSED"

if [ -n "$FAILED" ]; then
  printf '\033[31mfailed:\033[0m\n%s' "$FAILED"
  exit 1
fi

printf '\033[32mall gates passed\033[0m\n'
