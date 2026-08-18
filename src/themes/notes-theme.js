// Info: Notes theme - a partial VARIANT merged over base-theme. It re-brands the
// Notes app (teal), bumps the type ratio, and switches to a CUSTOM bundled font.
//
// DATA module (not a loader): pure, frozen, portable. Only the keys that differ
// from base are declared; Themer layers this over base at assembly time.
//
// FONT SYSTEM 3 of 3 - CUSTOM bundled font (Lora, a serif), shipped as a raw
// .ttf in fonts/assets/ and registered by the host manifest (fonts/fonts.js).
// If the .ttf has not been added yet the manifest skips it and this falls back
// to 'System' (see fonts/assets/index.js).
'use strict';


module.exports = Object.freeze({

  // ~~~~~~~~~~ Color ~~~~~~~~~~
  // Teal accent - everything else falls back to base.
  color: {
    primary: '#0D9488'
  },

  // ~~~~~~~~~~ Dimension ~~~~~~~~~~
  // A larger modular ratio gives Notes a more editorial type scale.
  dimension: {
    fontRatio: 1.25
  },

  // ~~~~~~~~~~ Font ~~~~~~~~~~
  // Lora (custom bundled serif). Registered under the family name 'Lora'.
  font: {
    roles: {
      primary: 'Lora',
      secondary: 'Lora'
    }
  }

});
