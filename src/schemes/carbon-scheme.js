// Info: Carbon scheme - spec-faithful IBM Carbon. Square corners (Carbon's
// signature), Carbon Blue 60 as the interactive colour, Carbon's grey ramp,
// and IBM Plex Sans. This is a complete scheme, not a partial variant: it
// differs from neutral-scheme in every token group, so layering over base
// would leave neutral values in place rather than replacing them.
//
// DATA module (not a loader): pure, frozen, portable, and server-sendable. The
// helper-themer package owns the engine + template; the app owns these
// values. The font families named here MUST be registered by the host font
// manifest (fonts/fonts.js). 'IBM Plex Sans' is loaded via @expo-google-fonts
// on native and @font-face on web.
//
// Carbon's radius is 0 for sm, md, and lg. Only `pill` keeps a non-zero value:
// Carbon v11 tags are genuinely pill-shaped, so squaring them would be less
// faithful, not more.


export default Object.freeze({

  // ~~~~~~~~~~ Color ~~~~~~~~~~
  // Carbon Blue 60 (#0f62fe) as the interactive colour. The template derives
  // the full UPPER_SNAKE token map (hovered, pressed, disabled, subtle) from
  // this single seed via mix operations against white.
  color: {
    primary: '#0f62fe',
    textPrimary: '#161616',
    backgroundPrimary: '#ffffff',
    success: '#198038',
    danger: '#da1e28',
    warning: '#f1c21b',
    info: '#0043ce'
  },

  // ~~~~~~~~~~ Dimension ~~~~~~~~~~
  // Carbon's type scale is 12/14/16/18/20/24 (ratio ~1.2 from base 16).
  // Spacing follows Carbon's 4/8/12/16/24/32 ramp (unit 4).
  // Radius is 0 for every step except pill: Carbon is square by specification.
  // The radius object overrides the template's literals (4/8/12) directly.
  dimension: {
    fontBase: 16,
    fontRatio: 1.2,
    spaceUnit: 4,
    lineHeightRatio: 1.4,
    radius: { none: 0, sm: 0, md: 0, lg: 0, pill: 999 }
  },

  // ~~~~~~~~~~ Font ~~~~~~~~~~
  // IBM Plex Sans. Loaded via @expo-google-fonts/ibm-plex-sans on native and
  // @font-face on web. The manifest registers the family under this name.
  font: {
    roles: {
      primary: 'IBM Plex Sans',
      secondary: 'IBM Plex Sans'
    }
  }

});
