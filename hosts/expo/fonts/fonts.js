// Info: Host font manifest — owns LOADING the font families that themes NAME.
// Keeping loading here (not in the themer package) is deliberate: require('font.ttf')
// is bundler-bound and a server-sent theme JSON cannot carry binaries, so the
// engine stays bundler-agnostic. Contract: if a theme names family X, this file
// must register X.
//
// This demo exercises all THREE delivery mechanisms at once:
//   1. SYSTEM  — family 'System'. Nothing to load (base / main app).
//   2. GOOGLE  — Poppins via @expo-google-fonts/poppins (tasks app).
//   3. CUSTOM  — Lora, a raw .ttf bundled in ./assets (notes app). Optional until
//                the file is dropped in (see ./assets/index.js).
// Mechanisms 2 and 3 funnel through the font helper adapter's loadManifest() —
// only the source of each font module differs (a package export vs a local require).
//
// Loader pattern: SINGLETON with dependency injection. The font core (Lib.Font)
// and the platform adapter (Lib.FontAdapter) arrive via Lib, matching the
// centralized-deps pattern.
'use strict';


// Font module sources (bundler-bound requires are a host concern, so they live here).
const Poppins = require('@expo-google-fonts/poppins');
const CustomFonts = require('./assets'); // raw .ttf map; {} until the file is added


// The manifest handed to the font core's registerFamilies(). Each family maps
// to a styles object whose entries carry the source for each platform:
//   asset — Expo requireable module (native)
//   url   — remote URL (web)
//   path  — local file path (native fallback)
const FONT_MANIFEST = Object.assign(
  {
    Poppins_400Regular: {
      styles: {
        normal: {
          asset: Poppins.Poppins_400Regular,
          weight: '400',
          style: 'normal'
        }
      }
    },
    Poppins_600SemiBold: {
      styles: {
        semibold: {
          asset: Poppins.Poppins_600SemiBold,
          weight: '600',
          style: 'normal'
        }
      }
    }
  }
);

// Custom fonts (Lora) are added to the manifest if ./assets exports any.
// Each custom entry uses the asset source (requireable .ttf).
const CustomKeys = Object.keys(CustomFonts);
for (let i = 0; i < CustomKeys.length; i++) {
  const key = CustomKeys[i];
  FONT_MANIFEST[key] = {
    styles: {
      normal: {
        asset: CustomFonts[key],
        weight: '400',
        style: 'normal'
      }
    }
  };
}


// Injected dependencies, set by the loader (module-scope).
let Lib;           // shared_libs container (requires Lib.Font, Lib.FontAdapter)
let Font;          // font core instance (required)
let FontAdapter;   // platform font loader adapter (required)


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects the font core + adapter via Lib, registers
font families from the manifest, and returns the font interface.

@param {Object} shared_libs - Lib container; requires Font + FontAdapter

@return {Object} - { families, loadFonts, isReady }
*********************************************************************/
module.exports = function loader (shared_libs) {

  // Capture injected deps
  Lib = shared_libs || {};

  // Font core and adapter are required
  Font = Lib.Font;
  FontAdapter = Lib.FontAdapter;
  if (!Font) {
    throw new TypeError('fonts: Lib.Font is required (inject the js-client-helper-font instance).');
  }
  if (!FontAdapter) {
    throw new TypeError('fonts: Lib.FontAdapter is required (inject a font loader adapter).');
  }

  // Register families from the manifest into the font core
  Font.registerFamilies(FONT_MANIFEST);

  // 'System' is always available; the rest are whatever the manifest registers
  const manifestResult = Font.getManifest();
  if (manifestResult.success) {
    Fonts.families = ['System'].concat(Object.keys(manifestResult.manifest));
  }

  return Fonts;

};/////////////////////////// Module-Loader END ////////////////////////////////



/////////////////////////// Public Functions START /////////////////////////////
const Fonts = { // Public font-manifest interface accessible by the host


  // ~~~~~~~~~~ Registry ~~~~~~~~~~
  // The family names this app has registered (filled by the loader). 'System'
  // is always present; bundled/Google families appear once their modules resolve.

  families: ['System'],


  // ~~~~~~~~~~ Loading ~~~~~~~~~~

  /********************************************************************
  Async: load every registered font via the platform adapter. Returns a
  Promise that resolves once all fonts have been loaded (or failed
  gracefully). The host root layout calls this in a useEffect and holds
  render until isReady() returns true.

  System-only builds resolve instantly (the manifest may be empty). A
  missing custom .ttf is simply absent from the manifest, so this never
  blocks on an unadded file.

  @return {Promise<Object>} - { success, error }
  *********************************************************************/
  loadFonts: async function () {

    // Nothing to load asynchronously -> ready immediately
    const manifestResult = Font.getManifest();
    if (!manifestResult.success || Object.keys(manifestResult.manifest).length === 0) {
      return { success: true, error: null };
    }

    // Delegate to the platform adapter
    return FontAdapter.loadManifest(manifestResult.manifest);

  },


  /********************************************************************
  Check whether all registered fonts have finished loading.

  @return {Boolean} - true once all registered fonts are loaded
  *********************************************************************/
  isReady: function () {

    const result = FontAdapter.isReady();
    return result.success && result.ready;

  }


};/////////////////////////// Public Functions END //////////////////////////////
