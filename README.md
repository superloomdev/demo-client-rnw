# Nimbus — RNW Super-App Demo (Client)

A runnable validation demo for the React Native Web super-app architecture: one pipeline for web, iOS, and Android, a Carbon-vocabulary token engine (Themer), and a super-app shape mechanism.

**Nimbus** is a shared spaces network — one account and one pass for finding, booking, and using bookable spaces across independent venue operators. For the full product definition, see the server repo's `PROJECT.md`.

The demo currently validates the architecture with two placeholder shapes (Tasks and Notes). The product definition defines five shapes: Member, Kiosk, Operations Board, Admin Console, and Launcher. Screen implementations are out of scope for the product-definition plan; this demo proves the shape mechanism and theming pipeline.

## Run it

```bash
# from hosts/expo/
npm install
npx expo install --fix     # align RN/Expo peer versions to the installed SDK
npm run web                # opens the web app on http://localhost:8081
```

- **Web:** `npm run web` (RNW bundled by Metro)
- **iOS/Android:** `npm start`, then scan the QR with Expo Go, or press `i`/`a`
- **Desktop (later):** Electron wraps the web build, no app code changes

## Repo structure

```
codebase-demo-client-rnw/
  hosts/
    expo/                  Expo project root — the only host shell (bare host deferred)
      app/                 Expo Router routes (thin aliases to packages/screens/)
      common/              Lib loader, config, superApp registry, client utils
      components/           Component library (atoms, molecules, variants, freeform)
      contexts/            React contexts (lib-context, theme-context)
      fonts/               Font manifest + assets
      themes/              Theme data (base, tasks, notes) + themer template + bridge
      metro.config.js      Metro config (packages/ watchFolder only — no aliases)
      package.json         All Superloom helpers consumed from GitHub Packages registry
  packages/
    screens/               Demo screens (main/Launcher, tasks/TasksList, notes/NotesList)
  README.md
  DECISIONS.md            Architecture decisions (design rationale for contributors)
```

## What to look at (the tour)

| Concept | Where |
|---|---|
| Super-app entry / shape routing | `hosts/expo/app/main/index.js`, `hosts/expo/app/_layout.js` |
| `Lib` loader / DI (same idiom as the backend) | `hosts/expo/common/loader.js` |
| Themer token engine (Carbon vocabulary) | `hosts/expo/themes/themer-template.js`, `themer-bridge.js` |
| Theme data (base + variants) | `hosts/expo/themes/base-theme.js`, `tasks-theme.js`, `notes-theme.js` |
| Component library (atoms/molecules) | `hosts/expo/components/` |
| Structured exception (variant) | `hosts/expo/components/variant/` |
| Unstructured exception (freeform) | `hosts/expo/components/freeform/` |
| Stub SDK (in-memory, no backend) | `hosts/expo/common/loader.js` (`_stubSdk()`) |
| App shapes (placeholder) | `packages/screens/tasks/`, `packages/screens/notes/` |
| Font loading (3 delivery mechanisms) | `hosts/expo/fonts/` |

## Helper modules

All Superloom helper modules are consumed from the GitHub Packages registry as normal npm dependencies — no Metro `watchFolders` or `extraNodeModules` aliases:

- `@superloomdev/js-helper-utils`
- `@superloomdev/js-helper-debug`
- `@superloomdev/js-client-helper-themer`

The themer engine resolves templates against layered overrides (base + variant) and emits platform-ready tokens. The app's `theme-context.js` uses Themer's native layer cascade: `buildTheme(template, [baseLayer, variantLayer], 'native')`.

## Product shapes (planned, not yet built)

| Shape | Replaces placeholder | Status |
|---|---|---|
| Member | Tasks | proposed |
| Kiosk | (new) | proposed |
| Operations board | (new) | proposed |
| Admin console | Notes | proposed |
| Launcher | existing shape selector | proposed |

## Notes / demo shortcuts

- Fonts use three delivery mechanisms: System (base), Google/Poppins (tasks), Custom/Lora (notes — optional, ships empty).
- State is React context plus a stub SDK (no Redux, no backend) to keep the focus on the architecture.
- The stub SDK provides in-memory CRUD for tasks and notes. The real SDK will be a published package from the server repo (Plan 0046).
- `DECISIONS.md` documents the architectural design decisions for this repo.
