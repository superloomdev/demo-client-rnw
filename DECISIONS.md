# Architecture Decisions

Design decisions that shape this repository. Each entry is terse — expand into
full docs when the pattern needs to be communicated beyond the team.

---

## Three-app mental model

Nimbus has three apps: `main` (the host), `tasks` (a guest), `notes` (a guest).
Guests can theoretically run standalone (lean mode). The host composes them.
The super-app shape is injected at runtime via `Lib.SuperApp.determineApp()`.

---

## Routing layer vs everything else

Two top-level folders have distinct, non-overlapping responsibilities:

- **`hosts/expo/app/`** — Expo Router's routing layer. Every file maps to a
  URL/screen. Expo Router owns this folder. Contains layouts and screen aliases
  only. No logic, no UI.
- **`packages/screens/`** — Actual screen UI and business logic. No routing.
  Reusable JS that any host can consume.

**Rule:** `app/` files are zero-logic wrappers — one line re-exporting a screen
from `packages/screens/`. All params, hooks, and logic go inside the screen
component. `packages/` never imports from `app/`.

This gives two things simultaneously:
1. File-based routing — Expo Router static analysis, deep links, typed routes.
2. Reusable screens — actual UI lives in `packages/screens/`, shareable across
   apps. A screen can be reused by pointing two wrappers at the same component.

---

## Per-app tree-shaking is a natural outcome

Because `app/tasks/` only imports from `packages/screens/tasks/`, building tasks
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
hosts/expo/contexts/lib-context.js
    ↓ calls loader() — memoized singleton
hosts/expo/common/loader.js              ← builds Lib + Config
    ↓ then ThemeProvider
hosts/expo/contexts/theme-context.js
    ↓ calls combineComponent()
hosts/expo/components/index.js           ← builds themed component library
    ↓
hosts/expo/app/index.js                  ← re-export → packages/screens/main/Launcher.js
```

**Rule:** `_layout.js` is the boot file. Loader is the DI root. Everything else
is wired through Lib.

---

## Peer-dependency pattern for packages

Mirrors the server-side helper module convention:

- `packages/screens/package.json` — `react`, `react-native`, `expo-router` as
  **peerDependencies**. The host owns and provides them.
- `hosts/expo/package.json` — all of the above as real **dependencies**. It is
  the host.

**Rule:** Packages declare what they need. Hosts provide it.

---

## Theme vocabulary: Template / Theme (base + variant)

- **Themer engine** — label-agnostic token resolution (Carbon vocabulary).
  Knows no `primary`, no `xs`. Zero deps. Published as
  `@superloomdev/js-client-helper-themer`.
- **Template** — the opinionated structure built on the engine. Declares the
  named tokens and their relationships: color tokens via mix/ref operations,
  modular/linear scales, font roles. Lives at `hosts/expo/themes/themer-template.js`.
- **Theme** — the *values* that fill a template. A theme is **base + variant**.
  `base` is the complete fallback; a `variant` is a partial that mints a new
  theme. Pure data → portable, server-sendable. Lives at
  `hosts/expo/themes/{base,tasks,notes}-theme.js`.

**Flow:** Themer's `buildTheme(template, [baseLayer, variantLayer], 'native')`
resolves the template against layered overrides and emits platform-ready tokens.
The `themer-bridge.js` converts theme scheme data into Themer layers and
reshapes emitted tokens into the `{ Color, Dimension, Font }` structure
components consume.

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
- **Theme data** (`themes/*.js`) — names the font FAMILY (e.g.,
  `primaryFamily: 'Poppins_400Regular'`)
- **Font manifest** (`fonts/fonts.js`) — owns LOADING those families

This separation is deliberate: `require('./font.ttf')` is bundler-bound
(Metro/Webpack), and a server-sent theme JSON cannot carry binaries. The themer
engine stays bundler-agnostic — it only names families. The host must register
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
(`theme-context.js`) live here. Plural — matches React community convention and
distinguishes from a generic `context/` that might hold non-React context code.

---

## Always use `localhost:8081` — no CORS hacks

Expo's CORS middleware blocks IDE browser preview proxies that use non-localhost
hosts. Always open the app directly at `http://localhost:8081` in your system
browser. No `node_modules` patches needed.

---

## Registry-only consumption

All Superloom helper modules are consumed from the GitHub Packages registry as
normal npm dependencies. No Metro `watchFolders` or `extraNodeModules` aliases.
This proves the app is a realistic consumer — it installs packages exactly as a
third-party application would.
