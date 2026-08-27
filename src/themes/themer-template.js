// Info: Themer template for Nimbus. Defines every token the component library
// consumes, using the themer engine's rule system (rampStep, hue, mix, scale
// generators). The bridge (themer-bridge.js) reshapes the flat emitted token
// map into the { Color, Dimension, Font } shape the components expect.
//
// Token naming convention: dotted paths that mirror the output structure:
//   color.APP_PRIMARY          -> Color.APP_PRIMARY
//   dimension.font_size.xs     -> Dimension.fontSize.xs
//   font.family.primary        -> Font.family.primary
//
// Pure data, no logic. The engine interprets this against layered overrides.


export default {

  polarity: 'light',

  ramp: [
    '#ffffff', '#f4f4f4', '#e0e0e0', '#c6c6c6', '#a8a8a8',
    '#8d8d8d', '#6f6f6f', '#525252', '#393939', '#262626', '#161616'
  ],

  palette: {
    blue60: '#0f62fe',
    red60: '#da1e28',
    green60: '#198038',
    yellow60: '#f1c21b',
    indigo60: '#4f46e5'
  },

  scales: {
    base_font_size: 16,
    geometric: { base: 16, ratio: 1.2 },
    miniUnit: { base: 4 }
  },

  tokens: {

    // Helper literals for mix operations (not consumed by components)
    _white: '#ffffff',
    _black: '#161616',

    // ---- Color: seed literals (overridden by theme layers) ----
    'color.APP_PRIMARY': '#4F46E5',
    'color.TEXT_PRIMARY': '#111827',
    'color.BACKGROUND_PRIMARY': '#FFFFFF',
    'color.STATUS_SUCCESS': '#0e6027',
    'color.STATUS_DANGER': '#da1e28',
    'color.STATUS_WARNING': '#8e6a00',
    'color.STATUS_INFO': '#0043ce',
    'color.TEXT_ON_PRIMARY': '#FFFFFF',

    // ---- Color: derived tokens ----
    'color.APP_PRIMARY_HOVERED': { op: 'mix', args: ['color.APP_PRIMARY', '_white', 90] },
    'color.APP_PRIMARY_PRESSED': { op: 'mix', args: ['color.APP_PRIMARY', '_white', 82] },
    'color.APP_PRIMARY_FOCUSED': { op: 'mix', args: ['color.APP_PRIMARY', '_white', 86] },
    'color.APP_PRIMARY_DISABLED': { op: 'mix', args: ['color.APP_PRIMARY', '_white', 45] },
    'color.APP_PRIMARY_SUBTLE': { op: 'mix', args: ['color.APP_PRIMARY', 'color.BACKGROUND_PRIMARY', 12] },

    'color.TEXT_SECONDARY': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 62] },
    'color.TEXT_MUTED': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 55] },
    'color.TEXT_DISABLED': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 34] },

    'color.BACKGROUND_SECONDARY': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 4] },
    'color.SURFACE': '{color.BACKGROUND_PRIMARY}',
    'color.BORDER': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 14] },
    'color.BORDER_STRONG': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 44] },
    'color.BORDER_SUBTLE': { op: 'mix', args: ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 14] },

    'color.STATUS_SUCCESS_SUBTLE': { op: 'mix', args: ['color.STATUS_SUCCESS', 'color.BACKGROUND_PRIMARY', 12] },
    'color.STATUS_DANGER_SUBTLE': { op: 'mix', args: ['color.STATUS_DANGER', 'color.BACKGROUND_PRIMARY', 12] },
    'color.STATUS_WARNING_SUBTLE': { op: 'mix', args: ['color.STATUS_WARNING', 'color.BACKGROUND_PRIMARY', 12] },
    'color.STATUS_INFO_SUBTLE': { op: 'mix', args: ['color.STATUS_INFO', 'color.BACKGROUND_PRIMARY', 12] },

    // ---- Dimension: font size scale (geometric, step offset from base) ----
    'dimension.font_size.xs': { scale: 'geometric', step: -1 },
    'dimension.font_size.sm': { scale: 'geometric', step: 0 },
    'dimension.font_size.md': { scale: 'geometric', step: 1 },
    'dimension.font_size.lg': { scale: 'geometric', step: 2 },
    'dimension.font_size.xl': { scale: 'geometric', step: 3 },
    'dimension.font_size.xxl': { scale: 'geometric', step: 4 },

    // ---- Dimension: spacing scale (miniUnit multiples) ----
    'dimension.space.none': { scale: 'miniUnit', multiplier: 0 },
    'dimension.space.xs': { scale: 'miniUnit', multiplier: 1 },
    'dimension.space.sm': { scale: 'miniUnit', multiplier: 2 },
    'dimension.space.md': { scale: 'miniUnit', multiplier: 3 },
    'dimension.space.lg': { scale: 'miniUnit', multiplier: 4 },
    'dimension.space.xl': { scale: 'miniUnit', multiplier: 6 },
    'dimension.space.xxl': { scale: 'miniUnit', multiplier: 8 },

    // ---- Dimension: radius scale (literals, overridden by theme layers) ----
    'dimension.radius.none': 0,
    'dimension.radius.sm': 4,
    'dimension.radius.md': 8,
    'dimension.radius.lg': 12,
    'dimension.radius.pill': 999,

    // ---- Dimension: scalar constants ----
    'dimension.line_height_ratio': 1.45,

    // ---- Font: family names (overridden by theme layers) ----
    'font.family.primary': 'System',
    'font.family.secondary': 'System',

    // ---- Font: weights ----
    'font.weight.regular': '400',
    'font.weight.medium': '500',
    'font.weight.semibold': '600',
    'font.weight.bold': '700'

  },

  meta: {
    '_white': { group: 'color' },
    '_black': { group: 'color' },

    'color.APP_PRIMARY': { group: 'color' },
    'color.TEXT_PRIMARY': { group: 'color' },
    'color.BACKGROUND_PRIMARY': { group: 'color' },
    'color.STATUS_SUCCESS': { group: 'color' },
    'color.STATUS_DANGER': { group: 'color' },
    'color.STATUS_WARNING': { group: 'color' },
    'color.STATUS_INFO': { group: 'color' },
    'color.TEXT_ON_PRIMARY': { group: 'color' },
    'color.APP_PRIMARY_HOVERED': { group: 'color' },
    'color.APP_PRIMARY_PRESSED': { group: 'color' },
    'color.APP_PRIMARY_FOCUSED': { group: 'color' },
    'color.APP_PRIMARY_DISABLED': { group: 'color' },
    'color.APP_PRIMARY_SUBTLE': { group: 'color' },
    'color.TEXT_SECONDARY': { group: 'color' },
    'color.TEXT_MUTED': { group: 'color' },
    'color.TEXT_DISABLED': { group: 'color' },
    'color.BACKGROUND_SECONDARY': { group: 'color' },
    'color.SURFACE': { group: 'color' },
    'color.BORDER': { group: 'color' },
    'color.BORDER_STRONG': { group: 'color' },
    'color.BORDER_SUBTLE': { group: 'color' },
    'color.STATUS_SUCCESS_SUBTLE': { group: 'color' },
    'color.STATUS_DANGER_SUBTLE': { group: 'color' },
    'color.STATUS_WARNING_SUBTLE': { group: 'color' },
    'color.STATUS_INFO_SUBTLE': { group: 'color' },

    'dimension.font_size.xs': { group: 'fontSize' },
    'dimension.font_size.sm': { group: 'fontSize' },
    'dimension.font_size.md': { group: 'fontSize' },
    'dimension.font_size.lg': { group: 'fontSize' },
    'dimension.font_size.xl': { group: 'fontSize' },
    'dimension.font_size.xxl': { group: 'fontSize' },
    'dimension.space.none': { group: 'dimension' },
    'dimension.space.xs': { group: 'dimension' },
    'dimension.space.sm': { group: 'dimension' },
    'dimension.space.md': { group: 'dimension' },
    'dimension.space.lg': { group: 'dimension' },
    'dimension.space.xl': { group: 'dimension' },
    'dimension.space.xxl': { group: 'dimension' },
    'dimension.radius.none': { group: 'dimension' },
    'dimension.radius.sm': { group: 'dimension' },
    'dimension.radius.md': { group: 'dimension' },
    'dimension.radius.lg': { group: 'dimension' },
    'dimension.radius.pill': { group: 'dimension' },
    'dimension.line_height_ratio': { group: 'raw' },

    'font.family.primary': { group: 'raw' },
    'font.family.secondary': { group: 'raw' },
    'font.weight.regular': { group: 'raw' },
    'font.weight.medium': { group: 'raw' },
    'font.weight.semibold': { group: 'raw' },
    'font.weight.bold': { group: 'raw' }
  },

  contrast_rules: [
    ['color.TEXT_PRIMARY', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.TEXT_PRIMARY', 'color.BACKGROUND_SECONDARY', 4.5],
    ['color.TEXT_PRIMARY', 'color.SURFACE', 4.5],
    ['color.TEXT_SECONDARY', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.TEXT_SECONDARY', 'color.BACKGROUND_SECONDARY', 4.5],
    ['color.TEXT_MUTED', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.TEXT_MUTED', 'color.BACKGROUND_SECONDARY', 4.5],
    ['color.TEXT_ON_PRIMARY', 'color.APP_PRIMARY', 4.5],
    ['color.STATUS_SUCCESS', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.STATUS_DANGER', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.STATUS_WARNING', 'color.BACKGROUND_PRIMARY', 4.5],
    ['color.STATUS_INFO', 'color.BACKGROUND_PRIMARY', 4.5]
  ]

};
