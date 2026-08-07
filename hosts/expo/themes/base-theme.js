// Info: Base theme — the COMPLETE fallback scheme. This is the neutral host
// theme used by the launcher (main app). Every other theme is a partial VARIANT
// layered over this base via Themer's native layer cascade, so this file must
// declare a value for every token group the template needs (color, dimension,
// font).
//
// DATA module (not a loader): pure, frozen, portable, and server-sendable. The
// js-client-helper-themer package owns the engine + template; the app owns these
// values. The font families named here MUST be registered by the host font
// manifest (fonts/fonts.js). 'System' is always available — no loading needed.
'use strict';


module.exports = Object.freeze({

  // ~~~~~~~~~~ Color ~~~~~~~~~~
  // Seed colors; the template derives the full UPPER_SNAKE token map from these.
  color: {
    primary: '#4F46E5',
    textPrimary: '#111827',
    backgroundPrimary: '#FFFFFF',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    info: '#2563EB'
  },

  // ~~~~~~~~~~ Dimension ~~~~~~~~~~
  // Seed numbers driving the modular type scale + linear spacing/radius scales.
  dimension: {
    fontBase: 16,
    fontRatio: 1.2,
    spaceUnit: 4,
    radiusUnit: 4,
    lineHeightRatio: 1.45
  },

  // ~~~~~~~~~~ Font ~~~~~~~~~~
  // FONT SYSTEM 1 of 3 — SYSTEM font. No asset to load; instant on every platform.
  font: {
    roles: {
      primary: 'System',
      secondary: 'System'
    }
  }

});
