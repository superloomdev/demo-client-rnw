// Info: The token -> atomic-utility-style generator. Given an assembled theme
// ({ Color, Dimension, Font }) it produces a Tailwind-like stylesheet of utility
// classes that components consume by name. Regenerated whenever the theme changes
// (the runtime-theming seam). Spacing utilities are LOGICAL (start/end), so layouts
// mirror correctly under RTL with no per-component work.
'use strict';

const { StyleSheet } = require('react-native');


// Build the padding style object for a logical/physical side
const paddingFor = function (side, value) {
  // Map each side code to its corresponding padding property
  switch (side) {
  case 'a': return { padding: value };
  case 'h': return { paddingHorizontal: value };
  case 'v': return { paddingVertical: value };
  case 't': return { paddingTop: value };
  case 'b': return { paddingBottom: value };
  case 's': return { paddingStart: value };   // RTL-aware
  case 'e': return { paddingEnd: value };      // RTL-aware
  default: return {};
  }
};

// Build the margin style object for a logical/physical side
const marginFor = function (side, value) {
  // Map each side code to its corresponding margin property
  switch (side) {
  case 'a': return { margin: value };
  case 'h': return { marginHorizontal: value };
  case 'v': return { marginVertical: value };
  case 't': return { marginTop: value };
  case 'b': return { marginBottom: value };
  case 's': return { marginStart: value };     // RTL-aware
  case 'e': return { marginEnd: value };        // RTL-aware
  default: return {};
  }
};


/********************************************************************
Generate the atomic utility stylesheet from a theme.

@param {Object} theme - { Color, Dimension, Font }

@return {Object} - StyleSheet of utility classes keyed by name
*********************************************************************/
module.exports = function generateCommonStyles (theme) {

  // Destructure theme tokens for concise utility-class generation
  const Color = theme.Color;
  const Dimension = theme.Dimension;
  const Font = theme.Font;

  // Initialize the accumulator that will hold every utility class
  const styles = {};

  // ~~~~~~~~~~ Font sizes (+ derived line-height) ~~~~~~~~~~
  Object.keys(Dimension.fontSize).forEach(function (key) {
    // Emit a font-size utility with derived line-height for each token
    const size = Dimension.fontSize[key];
    styles['font_size_' + key] = {
      fontSize: size,
      lineHeight: Math.round(size * Dimension.lineHeightRatio)
    };
  });

  // ~~~~~~~~~~ Font colors (curated token subset) ~~~~~~~~~~
  ['TEXT_PRIMARY', 'TEXT_SECONDARY', 'TEXT_MUTED', 'TEXT_DISABLED', 'TEXT_ON_PRIMARY',
    'APP_PRIMARY', 'STATUS_SUCCESS', 'STATUS_DANGER', 'STATUS_WARNING', 'STATUS_INFO']
    .forEach(function (token) {
      // Emit a text-color utility for each curated color token that exists
      if (Color[token] !== undefined) {
        styles['font_' + token.toLowerCase()] = { color: Color[token] };
      }
    });

  // ~~~~~~~~~~ Font weights (bound to the primary family) ~~~~~~~~~~
  Object.keys(Font.weight).forEach(function (w) {
    // Bind each weight to the primary font family
    styles['font_weight_' + w] = { fontWeight: Font.weight[w], fontFamily: Font.family.primary };
  });
  styles['font_family_secondary'] = { fontFamily: Font.family.secondary };

  // ~~~~~~~~~~ Backgrounds ~~~~~~~~~~
  ['APP_PRIMARY', 'APP_PRIMARY_HOVERED', 'APP_PRIMARY_PRESSED', 'APP_PRIMARY_DISABLED',
    'APP_PRIMARY_SUBTLE', 'BACKGROUND_PRIMARY', 'BACKGROUND_SECONDARY', 'SURFACE',
    'STATUS_SUCCESS', 'STATUS_SUCCESS_SUBTLE', 'STATUS_DANGER', 'STATUS_DANGER_SUBTLE',
    'STATUS_WARNING', 'STATUS_WARNING_SUBTLE', 'STATUS_INFO', 'STATUS_INFO_SUBTLE']
    .forEach(function (token) {
      // Emit a background-color utility for each surface token
      styles['background_' + token.toLowerCase()] = { backgroundColor: Color[token] };
    });

  // ~~~~~~~~~~ Borders ~~~~~~~~~~
  styles['border_default'] = { borderWidth: 1, borderColor: Color.BORDER };
  styles['border_top'] = { borderTopWidth: 1, borderColor: Color.BORDER };
  styles['border_primary'] = { borderWidth: 1, borderColor: Color.APP_PRIMARY };

  // ~~~~~~~~~~ Radii ~~~~~~~~~~
  Object.keys(Dimension.radius).forEach(function (key) {
    // Emit a border-radius utility for each radius token
    styles['br_' + key] = { borderRadius: Dimension.radius[key] };
  });

  // ~~~~~~~~~~ Spacing (logical sides for RTL: a/h/v/t/b/s/e) ~~~~~~~~~~
  const sides = ['a', 'h', 'v', 't', 'b', 's', 'e'];
  Object.keys(Dimension.space).forEach(function (token) {
    // Expand each spacing token into padding and margin utilities for all sides
    const value = Dimension.space[token];
    sides.forEach(function (side) {
      // Generate the padding and margin utility entries for this side
      styles['p_' + side + '_' + token] = paddingFor(side, value);
      styles['m_' + side + '_' + token] = marginFor(side, value);
    });
  });

  // Freeze into a native StyleSheet
  return StyleSheet.create(styles);

};
