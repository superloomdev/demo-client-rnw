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
  npx playwright test
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
