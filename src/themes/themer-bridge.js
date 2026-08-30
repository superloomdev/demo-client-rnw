// Info: Bridge between the themer engine and the { Color, Dimension, Font }
// shape the component library consumes. Two responsibilities:
//
// 1. schemeToLayer: convert a Nimbus theme scheme ({ color, dimension, font })
//    into a themer layer with dotted token names that match the template.
// 2. bridgeTheme: reshape the themer's flat emitted token map into the nested
//    { Color, Dimension, Font } structure.
//
// Pure functions, no side effects. The ThemeProvider calls these at assembly
// time.
//
// Raw `typeof` is used deliberately: this module is pure data-shaping with no
// `Lib` injection, so the Utils type primitives are not available.


// Mapping from theme scheme keys to themer template token names
const COLOR_KEYS = {
  primary: 'color.APP_PRIMARY',
  textPrimary: 'color.TEXT_PRIMARY',
  backgroundPrimary: 'color.BACKGROUND_PRIMARY',
  success: 'color.STATUS_SUCCESS',
  danger: 'color.STATUS_DANGER',
  warning: 'color.STATUS_WARNING',
  info: 'color.STATUS_INFO'
};

const DIMENSION_KEYS = {
  fontBase: 'scales.geometric.base',
  fontRatio: 'scales.geometric.ratio',
  spaceUnit: 'scales.miniUnit.base',
  lineHeightRatio: 'dimension.line_height_ratio'
};

// Legacy font keys for backward compatibility with schemes using
// primaryFamily/secondaryFamily instead of font.roles.
const LEGACY_FONT_KEYS = {
  primaryFamily: 'font.family.primary',
  secondaryFamily: 'font.family.secondary'
};


/********************************************************************
Convert a Nimbus theme scheme (base + variant merged) into a themer
layer with dotted token names and scale overrides.

@param {Object} scheme - merged theme values { color, dimension, font }
@param {String} [name] - layer name for debugging

@return {Object} - themer layer { name, polarity, tokens, scales }
*********************************************************************/
function schemeToLayer (scheme, name) {

  // Normalize the scheme into its sub-objects so downstream lookups are safe
  scheme = scheme || {};
  const color = scheme.color || {};
  const dimension = scheme.dimension || {};
  const font = scheme.font || {};

  // Prepare the token accumulator that will collect all dotted token names
  const tokens = {};

  // Color seeds
  for (const [schemeKey, tokenName] of Object.entries(COLOR_KEYS)) {
    if (color[schemeKey] !== undefined) {
      tokens[tokenName] = color[schemeKey];
    }
  }

  // TEXT_ON_PRIMARY: derive from luminance if not explicitly set
  if (color.primary !== undefined && tokens['color.TEXT_ON_PRIMARY'] === undefined) {
    const hex = color.primary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    tokens['color.TEXT_ON_PRIMARY'] = luminance < 128 ? '#FFFFFF' : '#111827';
  }

  // Dimension scalars
  for (const [schemeKey, tokenName] of Object.entries(DIMENSION_KEYS)) {
    if (dimension[schemeKey] !== undefined) {
      tokens[tokenName] = dimension[schemeKey];
    }
  }

  // Dimension radius overrides - a scheme may declare dimension.radius as a
  // nested object { sm, md, lg, pill } to override the template's literals.
  // This is the path Carbon uses: its radius is 0 for every step except pill.
  if (dimension.radius && typeof dimension.radius === 'object') {
    for (const [step, value] of Object.entries(dimension.radius)) {
      tokens['dimension.radius.' + step] = value;
    }
  }

  // Font families - prefer font.roles (per-theme), fall back to legacy keys
  if (font.roles && typeof font.roles === 'object') {
    for (const [roleName, familyName] of Object.entries(font.roles)) {
      if (familyName !== undefined) {
        tokens['font.family.' + roleName] = familyName;
      }
    }
  } else {
    for (const [schemeKey, tokenName] of Object.entries(LEGACY_FONT_KEYS)) {
      if (font[schemeKey] !== undefined) {
        tokens[tokenName] = font[schemeKey];
      }
    }
  }

  // Font weights
  if (font.weight) {
    if (font.weight.regular) {
      tokens['font.weight.regular'] = font.weight.regular;
    }
    if (font.weight.medium) {
      tokens['font.weight.medium'] = font.weight.medium;
    }
    if (font.weight.semibold) {
      tokens['font.weight.semibold'] = font.weight.semibold;
    }
    if (font.weight.bold) {
      tokens['font.weight.bold'] = font.weight.bold;
    }
  }

  // Scale overrides go into the scales property
  const scales = {};
  if (dimension.fontBase !== undefined || dimension.fontRatio !== undefined) {
    scales.geometric = {};
    if (dimension.fontBase !== undefined) {
      scales.geometric.base = dimension.fontBase;
    }
    if (dimension.fontRatio !== undefined) {
      scales.geometric.ratio = dimension.fontRatio;
    }
  }
  if (dimension.spaceUnit !== undefined) {
    scales.miniUnit = { base: dimension.spaceUnit };
  }

  // Return the assembled themer layer for the engine to merge
  return {
    name: name || 'theme',
    polarity: 'light',
    tokens: tokens,
    scales: scales
  };

}


/********************************************************************
Reshape the themer's flat emitted token map into the nested
{ Color, Dimension, Font } structure the components expect.

Tokens named color.APP_PRIMARY -> Color.APP_PRIMARY
Tokens named dimension.font_size.xs -> Dimension.fontSize.xs
Tokens named font.family.primary -> Font.family.primary

@param {Object} flat - flat emitted token map from themer.buildTheme()

@return {Object} - { Color, Dimension, Font }
*********************************************************************/
function bridgeTheme (flat) {

  // Prepare the nested output structures that components consume
  const Color = {};
  const Dimension = {};
  const Font = { family: {}, weight: {} };

  // Walk every emitted token and route it into the correct nested container
  for (const [key, value] of Object.entries(flat)) {

    // Skip helper tokens
    if (key.charAt(0) === '_') {
      continue;
    }

    // Split the dotted key into its namespace segments for routing
    const parts = key.split('.');

    // Route each token to its namespace bucket in the output structure
    if (parts[0] === 'color') {
      Color[parts[1]] = value;

    } else if (parts[0] === 'dimension') {

      if (parts.length === 3) {
        // dimension.font_size.xs -> Dimension.fontSize.xs
        // dimension.space.sm -> Dimension.space.sm
        // dimension.radius.md -> Dimension.radius.md
        const scaleName = parts[1].replace(/_([a-z])/g, function (_, c) {
          return c.toUpperCase();
        });
        if (!Dimension[scaleName]) {
          Dimension[scaleName] = {};
        }
        // The native projection emits numbers directly. Round to the
        // nearest integer because RN pixel-snaps at render time and
        // fractional values cause sub-pixel misalignment.
        Dimension[scaleName][parts[2]] = Math.round(value);
      } else {
        // dimension.line_height_ratio -> Dimension.lineHeightRatio
        const camelKey = parts[1].replace(/_([a-z])/g, function (_, c) {
          return c.toUpperCase();
        });
        Dimension[camelKey] = value;
      }

    } else if (parts[0] === 'font') {
      // font.family.primary -> Font.family.primary
      // font.weight.regular -> Font.weight.regular
      if (!Font[parts[1]]) {
        Font[parts[1]] = {};
      }
      Font[parts[1]][parts[2]] = value;
    }

  }

  // Return the nested theme structure for the component library
  return { Color: Color, Dimension: Dimension, Font: Font };

}


export default {
  schemeToLayer: schemeToLayer,
  bridgeTheme: bridgeTheme
};
