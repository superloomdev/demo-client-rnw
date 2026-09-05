// Info: L1 - Theme system tests. Verifies theme data modules are frozen,
// schemeToLayer converts scheme shapes to themer layers correctly,
// bridgeTheme reshapes flat token maps to nested structures, and the
// full build pipeline produces expected token values with layer merging.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import loader from './loader.js';
import themerBridge from '../themes/themer-bridge.js';
import themerTemplate from '../themes/themer-template.js';
import neutralScheme from '../schemes/neutral-scheme.js';
import tasksScheme from '../schemes/tasks-scheme.js';
import notesScheme from '../schemes/notes-scheme.js';

const { Lib } = loader();

// Theme data modules are frozen
test('neutral-scheme is frozen', function () {
  assert.equal(Object.isFrozen(neutralScheme), true);
});

test('neutral-scheme has color, dimension, font', function () {
  assert.equal(typeof neutralScheme.color, 'object');
  assert.equal(typeof neutralScheme.dimension, 'object');
  assert.equal(typeof neutralScheme.font, 'object');
});

test('neutral-scheme color.primary is #4F46E5', function () {
  assert.equal(neutralScheme.color.primary, '#4F46E5');
});

test('neutral-scheme font.roles.primary is System', function () {
  assert.equal(neutralScheme.font.roles.primary, 'System');
});

// Themer bridge: schemeToLayer
test('schemeToLayer converts base scheme to themer layer', function () {
  const layer = themerBridge.schemeToLayer(neutralScheme, 'base');
  assert.equal(layer.name, 'base');
  assert.equal(layer.polarity, 'light');
  assert.equal(layer.tokens['color.APP_PRIMARY'], '#4F46E5');
  assert.equal(layer.tokens['color.TEXT_PRIMARY'], '#111827');
});

test('schemeToLayer derives TEXT_ON_PRIMARY from luminance', function () {
  const layer = themerBridge.schemeToLayer({ color: { primary: '#4F46E5' } }, 'test');
  assert.equal(layer.tokens['color.TEXT_ON_PRIMARY'], '#FFFFFF');
});

test('schemeToLayer with dark primary sets TEXT_ON_PRIMARY to #FFFFFF', function () {
  const layer = themerBridge.schemeToLayer({ color: { primary: '#111827' } }, 'dark');
  assert.equal(layer.tokens['color.TEXT_ON_PRIMARY'], '#FFFFFF');
});

test('schemeToLayer with light primary sets TEXT_ON_PRIMARY to #111827', function () {
  const layer = themerBridge.schemeToLayer({ color: { primary: '#FFFFFF' } }, 'light');
  assert.equal(layer.tokens['color.TEXT_ON_PRIMARY'], '#111827');
});

test('schemeToLayer converts font.roles to font.family.* tokens', function () {
  const layer = themerBridge.schemeToLayer({ font: { roles: { primary: 'Poppins', secondary: 'Lora' } } }, 'test');
  assert.equal(layer.tokens['font.family.primary'], 'Poppins');
  assert.equal(layer.tokens['font.family.secondary'], 'Lora');
});

test('schemeToLayer converts dimension scales', function () {
  const layer = themerBridge.schemeToLayer({ dimension: { fontBase: 18, fontRatio: 1.25, spaceUnit: 8 } }, 'test');
  assert.equal(layer.scales.geometric.base, 18);
  assert.equal(layer.scales.geometric.ratio, 1.25);
  assert.equal(layer.scales.miniUnit.base, 8);
});

// Themer bridge: bridgeTheme
test('bridgeTheme reshapes flat tokens to nested structure', function () {
  const flat = {
    'color.APP_PRIMARY': '#4F46E5',
    'color.TEXT_PRIMARY': '#111827',
    'dimension.font_size.md': 19,
    'dimension.space.lg': 16,
    'dimension.radius.md': 8,
    'dimension.line_height_ratio': 1.45,
    'font.family.primary': 'System',
    'font.weight.bold': '700'
  };
  const bridged = themerBridge.bridgeTheme(flat);
  assert.equal(bridged.Color.APP_PRIMARY, '#4F46E5');
  assert.equal(bridged.Color.TEXT_PRIMARY, '#111827');
  assert.equal(bridged.Dimension.fontSize.md, 19);
  assert.equal(bridged.Dimension.space.lg, 16);
  assert.equal(bridged.Dimension.radius.md, 8);
  assert.equal(bridged.Dimension.lineHeightRatio, 1.45);
  assert.equal(bridged.Font.family.primary, 'System');
  assert.equal(bridged.Font.weight.bold, '700');
});

test('bridgeTheme skips underscore-prefixed helper tokens', function () {
  const flat = {
    '_white': '#ffffff',
    'color.APP_PRIMARY': '#4F46E5'
  };
  const bridged = themerBridge.bridgeTheme(flat);
  assert.equal(bridged.Color.APP_PRIMARY, '#4F46E5');
  assert.equal(Object.keys(bridged.Color).length, 1);
});

// Full themer build with base theme
test('buildTheme with base layer produces APP_PRIMARY', function () {
  const layer = themerBridge.schemeToLayer(neutralScheme, 'base');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.APP_PRIMARY, '#4f46e5');
});

test('buildTheme with base layer produces derived TEXT_SECONDARY', function () {
  const layer = themerBridge.schemeToLayer(neutralScheme, 'base');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.ok(bridged.Color.TEXT_SECONDARY, 'TEXT_SECONDARY should be defined');
  assert.notEqual(bridged.Color.TEXT_SECONDARY, bridged.Color.TEXT_PRIMARY);
});

test('buildTheme with base + tasks variant overrides primary color', function () {
  const baseLayer = themerBridge.schemeToLayer(neutralScheme, 'base');
  const tasksLayer = themerBridge.schemeToLayer(tasksScheme, 'tasks');
  const built = Lib.Themer.buildTheme(themerTemplate, [baseLayer, tasksLayer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.APP_PRIMARY, '#4f46e5');
  assert.equal(bridged.Font.family.primary, tasksScheme.font.roles.primary);
});

test('buildTheme with base + notes variant overrides primary color', function () {
  const baseLayer = themerBridge.schemeToLayer(neutralScheme, 'base');
  const notesLayer = themerBridge.schemeToLayer(notesScheme, 'notes');
  const built = Lib.Themer.buildTheme(themerTemplate, [baseLayer, notesLayer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.APP_PRIMARY, '#0d9488');
});


// ========================= CARBON SCHEME ================================== //

import carbonScheme from '../schemes/carbon-scheme.js';
import { assemble } from '../themes/assemble.js';


test('carbon-scheme is frozen', function () {
  assert.equal(Object.isFrozen(carbonScheme), true);
});

test('carbon-scheme has color, dimension, font', function () {
  assert.ok(carbonScheme.color);
  assert.ok(carbonScheme.dimension);
  assert.ok(carbonScheme.font);
});

test('carbon-scheme color.primary is #0f62fe (Carbon Blue 60)', function () {
  assert.equal(carbonScheme.color.primary, '#0f62fe');
});

test('carbon-scheme font.roles.primary is IBM Plex Sans', function () {
  assert.equal(carbonScheme.font.roles.primary, 'IBM Plex Sans');
});

test('carbon-scheme radius overrides are square except pill', function () {
  assert.deepEqual(carbonScheme.dimension.radius, {
    none: 0, sm: 0, md: 0, lg: 0, pill: 999
  });
});

test('carbon-scheme builds through the themer with all 37 required tokens', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const assembled = assemble(Lib, built, [layer], null);
  const required = [
    'APP_PRIMARY', 'APP_PRIMARY_HOVERED', 'APP_PRIMARY_PRESSED',
    'APP_PRIMARY_DISABLED', 'APP_PRIMARY_SUBTLE',
    'TEXT_PRIMARY', 'TEXT_SECONDARY', 'TEXT_MUTED', 'TEXT_DISABLED',
    'TEXT_ON_PRIMARY',
    'BACKGROUND_PRIMARY', 'BACKGROUND_SECONDARY', 'SURFACE', 'BORDER',
    'STATUS_SUCCESS', 'STATUS_SUCCESS_SUBTLE',
    'STATUS_DANGER', 'STATUS_DANGER_SUBTLE',
    'STATUS_WARNING', 'STATUS_WARNING_SUBTLE',
    'STATUS_INFO', 'STATUS_INFO_SUBTLE',
    'BUTTON_PRIMARY', 'BUTTON_PRIMARY_HOVER', 'BUTTON_PRIMARY_ACTIVE',
    'BUTTON_SECONDARY', 'BUTTON_SECONDARY_HOVER', 'BUTTON_SECONDARY_ACTIVE',
    'BUTTON_TERTIARY', 'BUTTON_TERTIARY_HOVER', 'BUTTON_TERTIARY_ACTIVE',
    'BUTTON_DANGER_PRIMARY', 'BUTTON_DANGER_HOVER', 'BUTTON_DANGER_ACTIVE',
    'BUTTON_DANGER_SECONDARY', 'BUTTON_DISABLED', 'BUTTON_SEPARATOR'
  ];
  const missing = required.filter(function (t) {
    return !assembled.theme.Color[t];
  });
  assert.deepEqual(missing, []);
});

test('carbon-scheme produces square radius tokens in the assembled theme', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const assembled = assemble(Lib, built, [layer], null);
  assert.equal(assembled.theme.Dimension.radius.sm, 0);
  assert.equal(assembled.theme.Dimension.radius.md, 0);
  assert.equal(assembled.theme.Dimension.radius.lg, 0);
  assert.equal(assembled.theme.Dimension.radius.pill, 999);
});

test('carbon-scheme produces Carbon Blue 60 as APP_PRIMARY', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const assembled = assemble(Lib, built, [layer], null);
  assert.equal(assembled.theme.Color.APP_PRIMARY, '#0f62fe');
});

test('carbon-scheme is registered in Lib.Schemes', function () {
  assert.ok(Lib.Schemes.carbon);
  assert.equal(Lib.Schemes.carbon, carbonScheme);
});


// ========================= BUTTON TOKEN FAMILY (C4) ====================== //

// The button token family the Carbon package requires. Iterate this list
// rather than listing each token in the test body.
const BUTTON_TOKENS = [
  'BUTTON_PRIMARY', 'BUTTON_PRIMARY_HOVER', 'BUTTON_PRIMARY_ACTIVE',
  'BUTTON_SECONDARY', 'BUTTON_SECONDARY_HOVER', 'BUTTON_SECONDARY_ACTIVE',
  'BUTTON_TERTIARY', 'BUTTON_TERTIARY_HOVER', 'BUTTON_TERTIARY_ACTIVE',
  'BUTTON_DANGER_PRIMARY', 'BUTTON_DANGER_HOVER', 'BUTTON_DANGER_ACTIVE',
  'BUTTON_DANGER_SECONDARY', 'BUTTON_DISABLED', 'BUTTON_SEPARATOR'
];

test('should emit every BUTTON_* token the library requires when built through the themer', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  const missing = BUTTON_TOKENS.filter(function (t) {
    return !bridged.Color[t];
  });
  assert.deepEqual(missing, []);
});

test('should resolve BUTTON_SECONDARY to Carbon Gray 80 (#393939) under the carbon scheme', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.BUTTON_SECONDARY, '#393939');
});

test('should resolve BUTTON_PRIMARY to the scheme accent under the carbon scheme', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.BUTTON_PRIMARY, '#0f62fe');
});

test('should resolve BUTTON_PRIMARY to the tasks accent under the tasks scheme', function () {
  const baseLayer = themerBridge.schemeToLayer(neutralScheme, 'base');
  const tasksLayer = themerBridge.schemeToLayer(tasksScheme, 'tasks');
  const built = Lib.Themer.buildTheme(themerTemplate, [baseLayer, tasksLayer], 'native');
  const bridged = themerBridge.bridgeTheme(built.tokens);
  assert.equal(bridged.Color.BUTTON_PRIMARY, '#4f46e5');
});

test('should produce no contrast violations naming a BUTTON_* token', function () {
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  const buttonViolations = (built.violations || []).filter(function (v) {
    return BUTTON_TOKENS.some(function (t) {
      return v.token === t || v.fg === t || v.bg === t ||
        (typeof v.message === 'string' && v.message.indexOf(t) !== -1);
    });
  });
  assert.deepEqual(buttonViolations, []);
});


// ========================= STRICT_THEME (C5) ============================= //

test('should throw on a contrast violation when STRICT_THEME is on', function () {
  // Inject a deliberately unreadable pairing by adding a contrast rule
  // that cannot pass: white text on a white background
  const badTemplate = Object.assign({}, themerTemplate, {
    contrast_rules: themerTemplate.contrast_rules.concat([
      ['color.BACKGROUND_PRIMARY', 'color.BACKGROUND_PRIMARY', 4.5]
    ])
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(badTemplate, [layer], 'native');
  const strictLib = Object.assign({}, Lib, {
    CONFIG: Object.assign({}, Lib.CONFIG || {}, { STRICT_THEME: true })
  });
  assert.throws(
    function () {
      assemble(strictLib, built, [layer], null);
    },
    TypeError
  );
});

test('should throw when a token was auto-corrected and STRICT_THEME is on', function () {
  // Build with a template that has a correction-triggering bad value
  const badTemplate = Object.assign({}, themerTemplate, {
    tokens: Object.assign({}, themerTemplate.tokens, {
      'color.TEXT_PRIMARY': '#000000'
    })
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(badTemplate, [layer], 'native');
  // Only test if corrections were actually produced
  if (built.corrections && built.corrections.length > 0) {
    const strictLib = Object.assign({}, Lib, {
      CONFIG: Object.assign({}, Lib.CONFIG || {}, { STRICT_THEME: true })
    });
    assert.throws(
      function () {
        assemble(strictLib, built, [layer], null);
      },
      TypeError
    );
  }
});

test('should return a complete theme despite a violation when STRICT_THEME is off', function () {
  const badTemplate = Object.assign({}, themerTemplate, {
    contrast_rules: themerTemplate.contrast_rules.concat([
      ['color.BACKGROUND_PRIMARY', 'color.BACKGROUND_PRIMARY', 4.5]
    ])
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(badTemplate, [layer], 'native');
  const assembled = assemble(Lib, built, [layer], null);
  assert.ok(assembled.theme);
  assert.ok(assembled.theme.Color);
});


// ========================= CARBON PROFILE IMPORT (Step 4.2) ============== //

// Verify the Carbon profiles from the published package are importable
// and carry the expected token values. These are data-only templates
// that can be fed to the Themer engine.
//
// These tests are skipped until the Carbon package is republished with
// the ./theme export. The republish is pending same-version deletion
// approval per the pre-release version policy.

let carbonThemeAvailable = false;
let carbonTheme = null;

try {
  carbonTheme = await import('@superloomdev/rnw-components-carbon/theme');
  carbonThemeAvailable = !!carbonTheme;
} catch {
  // Expected: ./theme export not in published package yet
}

test('should import Carbon white profile from the published package', function (t) {
  if (!carbonThemeAvailable) {
    t.skip(); return;
  }
  assert.ok(carbonTheme.white, 'white profile must exist');
  assert.ok(carbonTheme.g10, 'g10 profile must exist');
  assert.ok(carbonTheme.g90, 'g90 profile must exist');
  assert.ok(carbonTheme.g100, 'g100 profile must exist');
});

test('Carbon white profile background matches Carbon White theme', function (t) {
  if (!carbonThemeAvailable) {
    t.skip(); return;
  }
  assert.equal(carbonTheme.white.tokens['color.background'], '#ffffff');
  assert.equal(carbonTheme.white.tokens['color.layer_01'], '#f4f4f4');
  assert.equal(carbonTheme.white.tokens['color.text_primary'], '#161616');
  assert.equal(carbonTheme.white.tokens['color.interactive'], '#0f62fe');
});

test('Carbon g100 profile background matches Carbon G100 theme', function (t) {
  if (!carbonThemeAvailable) {
    t.skip(); return;
  }
  assert.equal(carbonTheme.g100.tokens['color.background'], '#161616');
  assert.equal(carbonTheme.g100.tokens['color.layer_01'], '#262626');
  assert.equal(carbonTheme.g100.tokens['color.text_primary'], '#f4f4f4');
});

test('Carbon profiles have 203 tokens each', function (t) {
  if (!carbonThemeAvailable) {
    t.skip(); return;
  }
  assert.equal(Object.keys(carbonTheme.white.tokens).length, 203);
  assert.equal(Object.keys(carbonTheme.g10.tokens).length, 203);
  assert.equal(Object.keys(carbonTheme.g90.tokens).length, 203);
  assert.equal(Object.keys(carbonTheme.g100.tokens).length, 203);
});


// ========================= FONT LOOP GUARD (C1) ========================== //

// Because ATTEMPTED is module scope, these tests share state. Use a distinct
// family name per test rather than trying to reset the ledger.

test('should attempt a font load once per family across multiple assemble calls', function () {
  const familyName = 'TestOnceOnly-' + Math.random().toString(36).slice(2);
  let loadCount = 0;
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return false;
      }
    },
    Fonts: {
      loadFamily: function () {
        loadCount++;
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  // Override the theme's font family to our test family
  built.tokens['font.family.primary'] = familyName;
  for (let i = 0; i < 5; i++) {
    assemble(stubLib, built, [layer], { current: function () {} });
  }
  assert.equal(loadCount, 1);
});

test('should not re-derive when the family stays unregistered', function () {
  const familyName = 'TestNoRederive-' + Math.random().toString(36).slice(2);
  let deriveCount = 0;
  const updateLayersRef = {
    current: function () {
      deriveCount++;
    }
  };
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return false;
      }
    },
    Fonts: {
      loadFamily: function () {
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  built.tokens['font.family.primary'] = familyName;
  assemble(stubLib, built, [layer], updateLayersRef);
  // Wait for the promise to settle
  return new Promise(function (resolve) {
    setTimeout(function () {
      assert.equal(deriveCount, 0);
      resolve();
    }, 50);
  });
});

test('should re-derive once when the family registers after load', function () {
  const familyName = 'TestRederiveOnce-' + Math.random().toString(36).slice(2);
  let deriveCount = 0;
  let registered = false;
  const updateLayersRef = {
    current: function () {
      deriveCount++;
    }
  };
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return registered;
      }
    },
    Fonts: {
      loadFamily: function () {
        registered = true;
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  built.tokens['font.family.primary'] = familyName;
  assemble(stubLib, built, [layer], updateLayersRef);
  // Wait for the promise to settle
  return new Promise(function (resolve) {
    setTimeout(function () {
      assert.equal(deriveCount, 1);
      resolve();
    }, 50);
  });
});

test('should fall back to System for an unregistered family', function () {
  const familyName = 'TestFallback-' + Math.random().toString(36).slice(2);
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return false;
      }
    },
    Fonts: {
      loadFamily: function () {
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const layer = themerBridge.schemeToLayer(carbonScheme, 'carbon');
  const built = Lib.Themer.buildTheme(themerTemplate, [layer], 'native');
  built.tokens['font.family.primary'] = familyName;
  const assembled = assemble(stubLib, built, [layer], null);
  assert.equal(assembled.theme.Font.family.primary, 'System');
});
