// Info: Raw bundled-font registry — the CUSTOM font delivery mechanism (system 3
// of 3). Each entry maps a family NAME to a require()'d .ttf asset. Metro resolves
// these requires at build time, so this file only requires files that actually
// exist: it ships EMPTY, and you enable Lora by (1) dropping the .ttf into this
// folder and (2) uncommenting the matching line below.
//
// Why empty by default: a require() to a missing file is a hard Metro build error
// (it cannot be caught at runtime), which would break every app's bundle. Shipping
// {} keeps the whole demo runnable now; the Notes theme falls back to 'System'
// until Lora is added.
//
// DATA module (not a loader): a plain map consumed by ../fonts.js.
'use strict';


module.exports = {

  // ~~~~~~~~~~ Lora (custom serif, OFL) ~~~~~~~~~~
  // 1. Download Lora from https://fonts.google.com/specimen/Lora (OFL license).
  // 2. Place 'Lora-Regular.ttf' in this folder (src/client/fonts/assets/).
  // 3. Uncomment the line below. The Notes app will then render in Lora.
  //
  // Lora: require('./Lora-Regular.ttf'),

};
