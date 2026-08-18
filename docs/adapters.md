# Adapter Contract

Internal reference for the host adapter system. Covers the three slots, their
contracts, the standard adapter shape, how to add a fourth host, and how to
add a fourth slot.

> **Full doctrine:** the language-agnostic composition and adapters doctrine
> lives in the Superloom constitution at
> [`docs/principles/composition-and-adapters.md`](https://github.com/superloomdev/superloom/blob/main/docs/principles/composition-and-adapters.md).
> The JavaScript implementation with worked examples is at
> [`docs/languages/js/composition-and-adapters.md`](https://github.com/superloomdev/superloom/blob/main/docs/languages/js/composition-and-adapters.md).
> This file is the application-specific reference; those files are the rules.

## The three slots

| Slot | Returns | Consumers |
|---|---|---|
| `Navigation` | `{ Link, Redirect }` | Screen files that render links or redirects |
| `Icons` | `{ Glyph }` | `src/components/atom/icon.js` |
| `Fonts` | `{ adapter, manifest }` where `adapter` has `loadManifest`, `isReady`, `isFamilyLoaded` | `src/fonts/fonts.js` |

### Navigation

`Link` is a component taking `href` and `children`. `Redirect` is a component
taking `href` that triggers a navigation effect on mount. Both map onto the
host's routing system. The Expo adapter uses `expo-router`; the web harness
adapter uses `window.history`.

### Icons

`Glyph` is a component taking `name`, `size`, `color`, and `style`. The Expo
adapter maps this onto `@expo/vector-icons/Ionicons`; the web harness adapter
renders a text placeholder. The vendor name stops at the adapter file.

### Fonts

`adapter` is an object with three methods:
- `loadManifest()` - returns a Promise that resolves when all font families are loaded
- `isReady()` - returns `{ success, ready }` synchronously
- `isFamilyLoaded(family)` - returns `{ success, loaded }` synchronously

`manifest` is a plain object mapping family names to asset definitions. The
Expo adapter supplies the platform font loader extension and the Poppins asset
manifest. The web harness adapter supplies a no-op loader and an empty manifest.

## Standard adapter shape

Every adapter file exports a factory function:

```js
module.exports = function (Lib, config) {
  return { /* ready-to-use object */ };
};
```

Adapters **return** their value. Adapters **never** assign onto `Lib`. The
loader owns every `Lib` key name. This makes vendor-named slots structurally
impossible rather than grep-enforced.

The loader validates all three slots at boot through `validateAdapters` in
`src/app-core/loader.validators.js`. A missing or non-function slot throws
`TypeError` before any component renders.

## How to add a fourth host

1. Create `hosts/<name>/` with its own `package.json` and bundler config
2. Create `hosts/<name>/adapters/{navigation,icons,fonts}.js` implementing the three contracts
3. Create the host entry point that requires the real loader and passes the adapter set to `LibProvider`
4. Add the host's build artifacts to `.gitignore`
5. Run `npm run check:portability` to confirm no coupling leaked into `src/`

The test tier at `src/_test/` is itself a host. It supplies stub adapters and
calls the real loader. Use it as a minimal reference.

## How to add a fourth slot

1. Add the slot name to `REQUIRED_ADAPTERS` in `src/app-core/loader.validators.js`
2. Add the adapter call and `Lib` assignment in `src/app-core/loader.js` after the existing adapter phase
3. Implement the adapter in every host: `hosts/expo/adapters/`, `hosts/web/adapters/`, and `src/_test/adapters/`
4. Add the slot to the contract table above

Adding a slot is a breaking change for every host, including the test host.
