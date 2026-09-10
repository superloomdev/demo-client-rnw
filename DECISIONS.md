# Architecture Decisions

Design decisions that shape this repository. Each entry is terse - expand into
full docs when the pattern needs to be communicated beyond the team.

---

## Three-app mental model

Nimbus has three apps: `main` (the host), `tasks` (a guest), `notes` (a guest).
Guests can theoretically run standalone (lean mode). The host composes them.
The super-app shape is injected at runtime via `Lib.SuperApp.determineApp()`.

---

## Routing layer vs everything else

Two top-level folders have distinct, non-overlapping responsibilities:

- **`hosts/expo/app/`** - Expo Router's routing layer. Every file maps to a
  URL/screen. Expo Router owns this folder. Contains layouts and screen aliases
  only. No logic, no UI.
- **`src/screens/`** - Actual screen UI and business logic. No routing.
  Reusable JS that any host can consume.

**Rule:** `app/` files are zero-logic wrappers - one line re-exporting a screen
from `src/screens/`. All params, hooks, and logic go inside the screen
component. `packages/` never imports from `app/`.

This gives two things simultaneously:
1. File-based routing - Expo Router static analysis, deep links, typed routes.
2. Reusable screens - actual UI lives in `src/screens/`, shareable across
   apps. A screen can be reused by pointing two wrappers at the same component.

---

## Per-app tree-shaking is a natural outcome

Because `app/tasks/` only imports from `src/screens/tasks/`, building tasks
in lean mode produces a bundle with zero notes or main code. Clean dependency
graph per app = free tree-shaking. No extra config needed.

---

## App boot chain

The entry chain from `package.json` to first render:

```
"main": "expo-router/entry"              ← package.json
    ↓ Expo Router scans app/ for routes
hosts/expo/app/_layout.js                ← FIRST app code (root layout)
    ↓ mounts LibProvider
src/app-core/contexts/lib-context.js
    ↓ calls loader() - memoized singleton
src/app-core/loader.js              ← builds Lib + Config
    ↓ then ThemeProvider
src/app-core/contexts/theme-context.js
    ↓ calls buildSystem()
src/themes/build-system.js          ← builds themed component system
    ↓
hosts/expo/app/index.js                  ← re-export → src/screens/main/Launcher.js
```

**Rule:** `_layout.js` is the boot file. Loader is the DI root. Everything else
is wired through Lib.

---

## Peer-dependency pattern for packages

Mirrors the server-side helper module convention:

- `src/screens/package.json` - `react`, `react-native`, `expo-router` as
  **peerDependencies**. The host owns and provides them.
- `hosts/expo/package.json` - all of the above as real **dependencies**. It is
  the host.

**Rule:** Packages declare what they need. Hosts provide it.

---

## Theme vocabulary: Contract, profile, layers

- **Themer engine** - the Superloom token contract owner. Published as
  `@superloomdev/js-client-helper-themer`. Knows every token name through
  `Themer.getContract()`; no component invents a name.
- **Profile** - a named, versioned set of reference templates with identity.
  `@superloomdev/js-client-helper-themer-template-carbon` is a profile with
  four schemes (`white`, `g10`, `g90`, `g100`).
- **Scheme** - a complete token set that replaces the base template.
  Switching a scheme changes the visual system.
- **Brand** - a sparse layer (only the tokens that differ). A brand overlays
  a scheme without rebuilding it. `tasks` and `notes` are brands.
- **Component system** - `@superloomdev/rnw-components`, a library whose
  components read tokens through generated style utilities and nothing else.

**Flow:** `buildTheme(template, [schemeLayer, brandLayer], 'native')` resolves
the template against layered overrides and emits platform-ready tokens.
`src/themes/build-system.js` builds the component system and registers the
published roster plus local app components.

---

## Two reference themes, one component system

The demo proves the token contract is a superset by rendering
Carbon-anatomy components under Material values without a single component
change. Anything that looks wrong under Material is either a mapping error in
the Material template package or a hardcoded value in the component library,
and both are defects; the demo is where they become visible.

---

## Font architecture: three delivery mechanisms

The demo exercises all three font delivery systems React Native supports,
unified through a single `expo-font` interface.

| Mechanism | App | Family | How it loads |
|-----------|-----|--------|--------------|
| **System** | `main` / base | `System` | Native platform font, nothing to load |
| **Google (package)** | `tasks` | `Poppins_400Regular` | `@expo-google-fonts/poppins` → `expo-font` |
| **Custom (bundled)** | `notes` | `Lora` | Raw `.ttf` in `fonts/assets/` → `expo-font` |

**Architecture separation:**
- **Theme data** (`themes/brand-layers.js`) - names the font FAMILY (e.g.,
  `font.family.sans: 'Poppins_400Regular'`)
- **Font manifest** (`fonts/fonts.js`) - owns LOADING those families

This separation is deliberate: `require('./font.ttf')` is bundler-bound
(Metro/Webpack asset loading, not CJS module loading), and a server-sent theme JSON cannot carry binaries. The themer
engine stays bundler-agnostic - it only names families. The host must register
whatever families the theme names.

**Loading flow:**
1. `loader.js` builds `Lib.Fonts` (injecting `Lib.FontLoader`)
2. Root layout (`app/_layout.js`) calls `Lib.Fonts.useFontsReady()`
3. `useFontsReady()` wraps `expo-font.useFonts(FONT_MAP)`:
   - Native: registers font faces with the OS
   - Web: injects matching `@font-face` CSS
4. Layout returns `null` until fonts ready, then renders the app

**Ships empty, enables later:** `fonts/assets/index.js` exports `{}` by default.
The Lora `.ttf` is commented out. To enable the custom font, drop the `.ttf`
into `fonts/assets/` and uncomment one line.

---

## Folder naming: `contexts/` (plural)

React context objects and hook definitions live in `hosts/expo/contexts/`.
Both the Lib context (`lib-context.js`) and the theme context
(`theme-context.js`) live here. Plural - matches React community convention and
distinguishes from a generic `context/` that might hold non-React context code.

---

## Always use `localhost:8081` - no CORS hacks

Expo's CORS middleware blocks IDE browser preview proxies that use non-localhost
hosts. Always open the app directly at `http://localhost:8081` in your system
browser. No `node_modules` patches needed.

---

## Registry-only consumption

All Superloom helper modules are consumed from the GitHub Packages registry as
normal npm dependencies. No Metro `watchFolders` or `extraNodeModules` aliases.
This proves the app is a realistic consumer - it installs packages exactly as a
third-party application would.

---

## Shared source in `src/`, hosts are thin builders

All application source lives in `src/` with no `package.json` and is never
published. Hosts (`hosts/expo`, `hosts/web`) are thin builders that wire
platform-specific dependencies and render shared screens. The dependency
direction is one-way: `src/` never imports from `hosts/`.

---

## Second web host is a portability harness, not a shipping pipeline

`hosts/web/` uses Vite and React Native Web to prove that `src/` contains no
framework coupling. It builds from the same `src/` the Expo host uses. Its
only job is to fail loudly when shared source acquires app-framework coupling.
It is not a production web build.

---

## Host-specific implementations enter through three validated adapter slots

Three capabilities cannot be shared across hosts: Navigation, Icons, and Fonts.
Each enters `src/` through an adapter - a factory function with the signature
`(Lib, config) => ready object`. The three slot names are `Navigation`,
`Icons`, and `Fonts`. Adapters return a value; the loader assigns every `Lib`
key, so no adapter can introduce a vendor-named slot. A missing or malformed
adapter throws `TypeError` at boot through `validateAdapters` in
`src/app-core/loader.validators.js`, before any component renders.

---

## Unified CI with seven jobs, iOS on macOS

A single `.github/workflows/ci.yml` runs on every push and PR to `main`. The
`test` and `lint` jobs gate five parallel jobs:
`expo-web`, `rnw-web`, `e2e`, `expo-android` (all ubuntu), and `expo-ios` (macOS).
All `superloomdev` repos are public, so macOS runners are free and unlimited.
The `test` job gates all builds because a coupling leak or unit test failure
invalidates every downstream artifact. iOS runs on every push, not
dispatch-only, because the cost is zero on a public repo. The APK artifact is
retained for 7 days so it can be downloaded and installed on a physical device
without a simulator.

---

## Theme selection ownership

The demo wrapper (`src/app-core/contexts/theme-context.js`) owns profile,
scheme, brand, and rederive epoch as React state. The themer extension
(`@superloomdev/js-client-helper-themer-ext-react`) is prop-driven: it
re-derives when the `template` or `layers` reference changes. The wrapper
passes the current template and layers as props to the extension's
ThemeProvider. A key prop forces a clean remount on selection change,
guaranteeing a single derivation per action. The `update_layers` API
remains available in the extension context for external consumers but is
not used as the demo's state transport.

Vocabulary:
- **Profile** - a versioned set of reference templates (e.g. Carbon v11,
  Material 3, Superloom base). Switching profiles changes the template.
- **Scheme** - a complete token set within a profile (e.g. Carbon white,
  g10, g90, g100). Switching schemes replaces the base layer.
- **Brand** - a partial overlay layer applied on top of the current scheme
  (e.g. tasks, notes). Switching brands adds or removes the overlay layer.

---

## Performance gate

A separate Playwright `perf` project runs six theme-switch scenarios at 4x
CDP CPU throttlement with one warmup and five measured iterations each.
Each scenario asserts exact build counts and p95 wall/build times against
a budget file (`e2e/perf/budgets.json`). The budget rule is
`max(50, ceil(p95 * 1.5 / 10) * 10)` ms for both wall and build fields.
To re-derive budgets after an intentional change, delete `budgets.json`,
run `npm run test:perf`, and commit the new file with the reason. The perf
project is gated in both `ci.yml` and `verify.sh` (9/9 gates).
