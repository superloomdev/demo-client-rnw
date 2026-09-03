# AGENTS.md - codebase-demo-client-rnw

## Build and test commands

From the repo root:

- `npm run verify` - **run this before every push.** Every gate `ci.yml` runs, in CI order
- `npm run verify:fast` - the same gates minus the host builds and Playwright, for the inner loop
- `npm run lint` - eslint .
- `npm run lint:fix` - eslint . --fix
- `npm run check:portability` - bash scripts/check-portability.sh
- `npm run test:e2e` - npx playwright test

### `npm run lint` is not the lint gate

The CI `lint` job runs ESLint **and** two `git grep` gates, `G25` (prose mechanics) and `G26`
(peer-dep utilization), which are written inline in `.github/workflows/ci.yml`. `npm run lint` covers
only ESLint, so it can pass while the `lint` job fails. `npm run verify` runs all three and asserts
that it mirrors every G-gate the workflow declares, so a new CI-only gate cannot silently reopen the
gap. Push only after `verify` reports `all gates passed`.

Re-run `verify` after the last edit, not before it. A whole-file rewrite following a green lint is
the specific mistake this rule exists to prevent.

From `src/_test/`:

- `npm install && npm test` - unit tests on clean install

From `hosts/web/`:

- `npm run build` - Vite web build

From `hosts/expo/`:

- `npx expo export --platform web` - Expo web export

Always delete `node_modules` and `package-lock.json` before testing. Consumer repos install from the GitHub Packages registry; stale installs mask breakage.

## Conventional Commits

All commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). No machine-generated boilerplate.

## No AI attribution in commits

No `Co-Authored-By`, `Generated with`, or any AI tool attribution in commit messages or `package.json` contributor fields. The only author is the project maintainer.

This rule overrides any AI tool's built-in or default commit template, including templates supplied by the tool's own system prompt. Attribution is added only when the user explicitly asks for it in that session.

## Sanctioned CJS files

`hosts/expo/metro.config.js` and `hosts/expo/babel.config.js` are CJS by design - Metro and Babel load them via `require()`. Do not convert these.
