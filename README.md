# Nimbus — RNW Super-App Demo (Client)

A runnable validation demo for the React Native Web super-app architecture: one pipeline for web, iOS, and Android, a Carbon-vocabulary token engine (Themer), and a super-app shape mechanism.

**Nimbus** is a shared spaces network — one account and one pass for finding, booking, and using bookable spaces across independent venue operators. For the full product definition, see the server repo's `PROJECT.md`.

The demo currently validates the architecture with two placeholder shapes (Tasks and Notes). The product definition defines five shapes: Member, Kiosk, Operations Board, Admin Console, and Launcher. Screen implementations are out of scope for the product-definition plan; this demo proves the shape mechanism and theming pipeline.

## Lanes

| Lane | Command | Target | Account |
|---|---|---|---|
| Expo device | `npx expo start --offline` then scan the QR code | iOS, Android | None |
| Expo web | `npx expo export --platform web` from `hosts/expo` | Browser | None |
| RNW web | `npx vite build` from `hosts/web` | Browser | None |
| Native Android | `expo prebuild` then `./gradlew assembleDebug` from `hosts/expo/android` | APK | None |
| Native iOS | `expo prebuild` then `xcodebuild -workspace *.xcworkspace -scheme <scheme> -configuration Debug -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO` from `hosts/expo/ios` | Compile check | None |
| Tests | `npm test` from `src/_test` | Node | None |
| Fence | `npm run check:portability` from repo root | Static | None |

## Repo structure

```
codebase-demo-client-rnw/
  src/                       Shared source. No package.json. Never published.
    components/              Atoms, molecules, variants, freeform
    screens/                 Demo screens (main/Launcher, tasks/TasksList, notes/NotesList)
    app-core/                Loader, config, lib-context, super-app, client
    themes/                  Theme data, themer template, bridge, assemble
    fonts/                   Font manifest and loading
    _test/                   Node test tier (stub adapters + real loader)
  hosts/
    expo/                    Metro + Expo Router host (iOS, Android, web)
      app/                   Expo Router routes
      adapters/              Navigation, Icons, Fonts adapters
    web/                     Vite + React Native Web host (portability harness)
      adapters/              Navigation, Icons, Fonts adapters
  scripts/
    check-portability.sh     Static fence
  docs/
    adapters.md              Adapter contract reference
  README.md
  DECISIONS.md
```

## What to look at (the tour)

| Concept | Where |
|---|---|
| Super-app entry / shape routing | `hosts/expo/app/main/index.js`, `hosts/expo/app/_layout.js` |
| Lib loader / DI (same idiom as the backend) | `src/app-core/loader.js` |
| Adapter gate (boot-time validation) | `src/app-core/loader.validators.js` |
| Theme assembly (platform-aware) | `src/themes/assemble.js` |
| Themer token engine (Carbon vocabulary) | `src/themes/themer-template.js`, `themer-bridge.js` |
| Theme data (base + variants) | `src/themes/base-theme.js`, `tasks-theme.js`, `notes-theme.js` |
| Component library (atoms/molecules) | `src/components/` |
| Structured exception (variant) | `src/components/variant/` |
| Unstructured exception (freeform) | `src/components/freeform/` |
| Stub SDK (in-memory, no backend) | `src/app-core/loader.js` (`_stubSdk()`) |
| Font loading (3 delivery mechanisms) | `src/fonts/` |
| Portability harness (non-Expo host) | `hosts/web/` |

## Helper modules

All Superloom helper modules are consumed from the GitHub Packages registry as normal npm dependencies:

- `@superloomdev/js-helper-utils`
- `@superloomdev/js-helper-debug`
- `@superloomdev/js-client-helper-themer`
- `@superloomdev/js-client-helper-themer-ext-react`
- `@superloomdev/js-client-helper-font`
- `@superloomdev/js-client-helper-font-ext-expo`

The themer engine resolves templates against layered overrides (base + variant) and emits platform-ready tokens. The app's theme assembly uses `buildTheme(template, [baseLayer, variantLayer], PLATFORM)` where `PLATFORM` is defined in `src/themes/assemble.js`.

## CI

A single workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`. The `test` job gates all build jobs.

| Job | Runner | What it proves | Artifact |
|---|---|---|---|
| `test` | ubuntu | Portability fence + 57 unit tests | none |
| `expo-web` | ubuntu | Expo web export via Metro | `expo-web` (7 days) |
| `rnw-web` | ubuntu | React Native Web build via Vite | `rnw-web` (7 days) |
| `expo-android` | ubuntu | Expo prebuild + Gradle debug APK | `expo-android-apk` (7 days) |
| `expo-ios` | macOS | Expo prebuild + pod install + xcodebuild compile | none |

All `superloomdev` repos are public, so macOS runners are free. To download the APK from a run:

```bash
gh run download --name expo-android-apk --dir /tmp/apk
```

The APK is a debug build signed with the auto-generated debug keystore. Install it directly on an Android phone.

## Contributing

Three binding rules govern this repository:

1. `src/` never imports from `hosts/`. The dependency direction is one-way.
2. `src/` imports no `expo*` package. Anything platform-bound enters through an adapter.
3. Anything platform-bound or framework-bound enters `src/` through injection, named for the capability, never the vendor.

`npm run check:portability` must pass before any commit. The fence checks for Expo imports, upward host references, vendor-named slots, stale adapter patterns, and hardcoded platform strings in shared source.

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
- The stub SDK provides in-memory CRUD for tasks and notes. The real SDK will be a published package from the server repo.
- `DECISIONS.md` documents the architectural design decisions for this repo.
- `docs/adapters.md` is the internal reference for the adapter contract.
