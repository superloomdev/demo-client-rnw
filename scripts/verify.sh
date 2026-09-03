#!/usr/bin/env bash
# Info: Local CI parity gate. Runs every check .github/workflows/ci.yml runs,
# in the same order, so a push never discovers a failure the workstation could
# have reported in seconds.
#
# The grep gates (G25, G26) live only in the workflow YAML, so they are
# duplicated here. When a gate changes in ci.yml it must change here too;
# GATE COUNT below is asserted against the workflow to catch that drift.
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


# ------------------------------ Gate: eslint ------------------------------ #

gate_eslint () {
  npx eslint .
}


# ------------------------- Gate: G25 prose mechanics ---------------------- #
# Mirrors ci.yml "G25 - Prose mechanics" on the same file set.
#
# The patterns are assembled from fragments rather than written out, because
# this file is itself a tracked file the gate scans: spelling out the banned
# words here would make the gate fail on its own source. ci.yml escapes that
# by living under an excluded path. Adding scripts/ to the exclusions instead
# would blind the gate to every future script, so the pattern is split.

gate_g25 () {
  local brit em hits em_hits
  brit="colo""ur|behavi""our|recogni""s|initiali""s|optimi""se|optimi""sation"
  em=$(printf '\xe2\x80\x94')

  hits=$(git grep -niE "$brit" -- . ':(exclude)*/node_modules/*' ':(exclude).github/*' ':(exclude)*package-lock.json' 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "FAIL: British spelling found. Use American English (color, behavior, recognize, initialize, optimize)."
    echo "$hits"
    return 1
  fi

  em_hits=$(git grep -n "$em" -- . ':(exclude)*/node_modules/*' ':(exclude).github/*' ':(exclude)*package-lock.json' 2>/dev/null || true)
  if [ -n "$em_hits" ]; then
    echo "FAIL: em dash found. Use a comma, a period, or ' - ' instead."
    echo "$em_hits"
    return 1
  fi

  echo "PASS: no British spelling or em dash in tracked files"
}


# ---------------------- Gate: G26 peer-dep utilization -------------------- #
# Mirrors ci.yml "G26 - Peer-dep utilization". Kept byte-identical.

gate_g26 () {
  local hits
  hits=$(git grep -nE "\.length (===|!==|>) 0|(===|!==) ''|Object\.keys\([^)]+\)\.length (===|!==|>) 0" -- '*.js' '*.jsx' ':(exclude)*/node_modules/*' ':(exclude).github/*' ':(exclude)src/_test/*' ':(exclude)src/app-core/loader.validators.js' 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "FAIL: raw length or keys check found. Use Lib.Utils.isEmptyArray, isEmptyObject, or isEmptyString."
    echo "$hits"
    return 1
  fi
  echo "PASS: no raw length or keys checks in module source"
}


# --------------------- Gate: workflow gate-count drift -------------------- #
# A grep gate added to ci.yml but not to this script would leave a CI-only
# check, which is the exact gap this script exists to close.

gate_parity () {
  local declared expected
  declared=$(grep -cE '^      - name: G[0-9]+' .github/workflows/ci.yml || true)
  expected=2
  if [ "$declared" != "$expected" ]; then
    echo "FAIL: ci.yml declares $declared G-gates but verify.sh mirrors $expected."
    echo "Add the new gate to scripts/verify.sh and update the expected count."
    return 1
  fi
  echo "PASS: verify.sh mirrors all $declared ci.yml grep gates"
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
run_gate 'eslint' gate_eslint
run_gate 'G25 prose mechanics' gate_g25
run_gate 'G26 peer-dep utilization' gate_g26
run_gate 'ci.yml gate parity' gate_parity
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
