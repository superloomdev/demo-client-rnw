---
description: Pre-commit protocol and code quality for demo-client-rnw
---

# Demo Client RNW Workflow

The pre-commit protocol for the demo-client-rnw app. Run before every commit or push. No commit happens until all three gates pass locally.

Invoke as: `/demo-client-rnw`

## Operating Principle

> **CI is the second line of defense, not the first.** A CI run that fails on something testable locally is wasted pipeline time and a polluted git log. The Pre-Commit Protocol catches issues before they reach GitHub.

## Pre-Commit Protocol (mandatory, every commit)

### Gate 1: Fresh install (web host)

Wipe `node_modules/` and `package-lock.json` for a truly clean state. Everything must come from the registry - no stale dependencies, no hoisted modules from a previous session.

// turbo
```bash
# Cwd = codebase-demo-client-rnw/hosts/web
rm -rf node_modules package-lock.json && npm install 2>&1 | tail -5
```

### Gate 2: Lint

// turbo
```bash
# Cwd = codebase-demo-client-rnw
npm run lint 2>&1 | tail -10
```

Must exit `0` with no errors and no warnings.

### Gate 3: Playwright e2e tests

Start the web host, wait for it to be ready, then run the Playwright test suite.

// turbo
```bash
# Cwd = codebase-demo-client-rnw/hosts/web
npm run dev &
sleep 5
```

// turbo
```bash
# Cwd = codebase-demo-client-rnw
npx playwright test 2>&1 | tail -30
```

After tests, stop the web host:
```bash
kill %1 2>/dev/null
```

Must exit `0` with all tests passing.

### Then commit

Only after all three gates pass:

1. `git add` the files belonging to this repo
2. Commit with a descriptive message
3. Push - CI will run the same gates again

If any gate fails, fix the issue before committing. Never push with a known failure.

## Reference

See `codebase-superloom/docs/dev/testing-local-modules.md` - Pre-Commit Protocol for the full protocol and the rationale behind the fresh-install requirement.
