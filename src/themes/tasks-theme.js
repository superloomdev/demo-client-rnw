// Info: Tasks theme - a partial VARIANT merged over base-theme. It re-brands the
// Tasks app (indigo) and switches its typeface to a GOOGLE font.
//
// DATA module (not a loader): pure, frozen, portable. Only the keys that differ
// from base are declared; Themer layers this over base at assembly time.
//
// FONT SYSTEM 2 of 3 - GOOGLE font (Poppins), delivered via @expo-google-fonts.
// The family names below MUST match the keys the host font manifest registers
// (fonts/fonts.js) through expo-font, which works on native and injects the
// matching @font-face on web.
'use strict';


module.exports = Object.freeze({

  // ~~~~~~~~~~ Color ~~~~~~~~~~
  // Indigo accent - everything else falls back to base.
  color: {
    primary: '#4F46E5'
  },

  // ~~~~~~~~~~ Font ~~~~~~~~~~
  // Poppins (Google). Regular drives body; the manifest also loads SemiBold so
  // weighted utilities resolve to a real face on native.
  font: {
    roles: {
      primary: 'Poppins_400Regular',
      secondary: 'Poppins_600SemiBold'
    }
  }

});
