// Info: L1 - Theme system tests. Verifies the Carbon profile from the
// published themer-template-carbon package, the brand layer definitions,
// and the full build pipeline through the Themer engine and build-system.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import loader from './loader.js';
import { BRAND_LAYERS } from '../themes/brand-layers.js';
import { buildSystem } from '../themes/build-system.js';

const { Lib } = loader();

// ========================= CARBON PROFILE ================================= //

const profile = Lib.Themes.profiles.carbon;

test('Carbon profile has id carbon-v11 and contract_version 2', function () {
  assert.equal(profile.id, 'carbon-v11');
  assert.equal(profile.contract_version, 2);
});

test('Carbon profile has white, g10, g90, g100 schemes', function () {
  assert.ok(profile.schemes.white);
  assert.ok(profile.schemes.g10);
  assert.ok(profile.schemes.g90);
  assert.ok(profile.schemes.g100);
});

test('Carbon white scheme has 380 tokens', function () {
  assert.equal(Object.keys(profile.schemes.white.tokens).length, 380);
});

test('Carbon white scheme background is #ffffff', function () {
  assert.equal(profile.schemes.white.tokens['color.background'], '#ffffff');
});

test('Carbon white scheme interactive is Carbon Blue 60 (#0f62fe)', function () {
  assert.equal(profile.schemes.white.tokens['color.interactive'], '#0f62fe');
});

test('Carbon white scheme text_primary is #161616', function () {
  assert.equal(profile.schemes.white.tokens['color.text_primary'], '#161616');
});

test('Carbon white scheme layer_01 is #f4f4f4', function () {
  assert.equal(profile.schemes.white.tokens['color.layer_01'], '#f4f4f4');
});

test('Carbon g100 scheme background is #161616', function () {
  assert.equal(profile.schemes.g100.tokens['color.background'], '#161616');
});

test('Carbon g100 scheme text_primary is #f4f4f4', function () {
  assert.equal(profile.schemes.g100.tokens['color.text_primary'], '#f4f4f4');
});


// ========================= MATERIAL PROFILE ================================ //

const materialProfile = Lib.Themes.profiles.material;

test('Material profile has id material-v0_192 and contract_version 2', function () {
  assert.equal(materialProfile.id, 'material-v0_192');
  assert.equal(materialProfile.contract_version, 2);
});

test('Material profile has light and dark schemes', function () {
  assert.ok(materialProfile.schemes.light);
  assert.ok(materialProfile.schemes.dark);
});

test('Material light scheme has 380 tokens', function () {
  assert.equal(Object.keys(materialProfile.schemes.light.tokens).length, 380);
});

test('Material dark scheme has 380 tokens', function () {
  assert.equal(Object.keys(materialProfile.schemes.dark.tokens).length, 380);
});

test('buildTheme with Material light scheme produces 380 tokens', function () {
  const lightScheme = materialProfile.schemes.light;
  const baseScheme = Lib.Themes.profiles.base.schemes.light;
  const template = {
    ...lightScheme,
    ...(lightScheme.ramp || baseScheme.ramp ? { ramp: lightScheme.ramp || baseScheme.ramp } : {}),
    ...(lightScheme.palette || baseScheme.palette ? { palette: lightScheme.palette || baseScheme.palette } : {})
  };
  const baseLayer = { name: 'base', tokens: lightScheme.tokens, scales: lightScheme.scales, polarity: lightScheme.polarity };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(Object.keys(built.tokens).length, 380);
});

test('buildTheme with Material light scheme produces no violations', function () {
  const lightScheme = materialProfile.schemes.light;
  const baseScheme = Lib.Themes.profiles.base.schemes.light;
  const template = {
    ...lightScheme,
    ...(lightScheme.ramp || baseScheme.ramp ? { ramp: lightScheme.ramp || baseScheme.ramp } : {}),
    ...(lightScheme.palette || baseScheme.palette ? { palette: lightScheme.palette || baseScheme.palette } : {})
  };
  const baseLayer = { name: 'base', tokens: lightScheme.tokens, scales: lightScheme.scales, polarity: lightScheme.polarity };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.deepEqual(built.violations || [], []);
});

test('buildSystem with Material light scheme produces a valid system', function () {
  const lightScheme = materialProfile.schemes.light;
  const baseScheme = Lib.Themes.profiles.base.schemes.light;
  const template = {
    ...lightScheme,
    ...(lightScheme.ramp || baseScheme.ramp ? { ramp: lightScheme.ramp || baseScheme.ramp } : {}),
    ...(lightScheme.palette || baseScheme.palette ? { palette: lightScheme.palette || baseScheme.palette } : {})
  };
  const baseLayer = { name: 'base', tokens: lightScheme.tokens, scales: lightScheme.scales, polarity: lightScheme.polarity };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  const result = buildSystem(Lib, built, [baseLayer], null, null, null, 'base');
  assert.ok(result.system);
  assert.ok(result.system.Component);
  assert.ok(result.system.Style);
  assert.ok(result.theme);
});

test('Material light scheme resolves color.layer_accent_01 to a hex value', function () {
  const lightScheme = materialProfile.schemes.light;
  const baseScheme = Lib.Themes.profiles.base.schemes.light;
  const template = {
    ...lightScheme,
    ...(lightScheme.ramp || baseScheme.ramp ? { ramp: lightScheme.ramp || baseScheme.ramp } : {}),
    ...(lightScheme.palette || baseScheme.palette ? { palette: lightScheme.palette || baseScheme.palette } : {})
  };
  const baseLayer = { name: 'base', tokens: lightScheme.tokens, scales: lightScheme.scales, polarity: lightScheme.polarity };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.ok(built.tokens['color.layer_accent_01'], 'color.layer_accent_01 should be defined');
  assert.match(String(built.tokens['color.layer_accent_01']), /^#/, 'should be a hex color');
});


// ========================= BASE PROFILE ==================================== //

const baseProfile = Lib.Themes.profiles.base;

test('Base profile has id superloom-base and contract_version 2', function () {
  assert.equal(baseProfile.id, 'superloom-base');
  assert.equal(baseProfile.contract_version, 2);
});

test('Base profile has light and dark schemes', function () {
  assert.ok(baseProfile.schemes.light);
  assert.ok(baseProfile.schemes.dark);
});

test('buildTheme with base light scheme produces 380 tokens', function () {
  const lightScheme = baseProfile.schemes.light;
  const template = {
    ...lightScheme,
    ...(lightScheme.ramp ? { ramp: lightScheme.ramp } : {}),
    ...(lightScheme.palette ? { palette: lightScheme.palette } : {})
  };
  const baseLayer = { name: 'base', tokens: lightScheme.tokens, scales: lightScheme.scales, polarity: lightScheme.polarity };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(Object.keys(built.tokens).length, 380);
});


// ========================= BRAND LAYERS ==================================== //

test('BRAND_LAYERS has tasks, notes, and rounded', function () {
  assert.ok(BRAND_LAYERS.tasks);
  assert.ok(BRAND_LAYERS.notes);
  assert.ok(BRAND_LAYERS.rounded);
});

test('tasks brand layer has name tasks', function () {
  assert.equal(BRAND_LAYERS.tasks.name, 'tasks');
});

test('tasks brand layer overrides color.interactive to #4f46e5', function () {
  assert.equal(BRAND_LAYERS.tasks.tokens['color.interactive'], '#4f46e5');
});

test('tasks brand layer overrides color.button_primary to #4f46e5', function () {
  assert.equal(BRAND_LAYERS.tasks.tokens['color.button_primary'], '#4f46e5');
});

test('tasks brand layer overrides shape.radius_04 to 8', function () {
  assert.equal(BRAND_LAYERS.tasks.tokens['shape.radius_04'], 8);
});

test('tasks brand layer overrides shape.radius_08 to 12', function () {
  assert.equal(BRAND_LAYERS.tasks.tokens['shape.radius_08'], 12);
});

test('tasks brand layer sets font.family.sans to Poppins', function () {
  assert.equal(BRAND_LAYERS.tasks.tokens['font.family.sans'], 'Poppins');
});

test('notes brand layer has name notes', function () {
  assert.equal(BRAND_LAYERS.notes.name, 'notes');
});

test('notes brand layer overrides color.interactive to #0d9488', function () {
  assert.equal(BRAND_LAYERS.notes.tokens['color.interactive'], '#0d9488');
});

test('notes brand layer sets font.family.sans to Lora', function () {
  assert.equal(BRAND_LAYERS.notes.tokens['font.family.sans'], 'Lora');
});

test('notes brand layer sets font.family.serif to Lora', function () {
  assert.equal(BRAND_LAYERS.notes.tokens['font.family.serif'], 'Lora');
});

test('rounded brand layer has name rounded', function () {
  assert.equal(BRAND_LAYERS.rounded.name, 'rounded');
});

test('rounded brand layer sets feedback.field to outline', function () {
  assert.equal(BRAND_LAYERS.rounded.tokens['feedback.field'], 'outline');
});

test('rounded brand layer sets shape.radius_00 to 8', function () {
  assert.equal(BRAND_LAYERS.rounded.tokens['shape.radius_00'], 8);
});

test('rounded brand layer has exactly two tokens', function () {
  assert.equal(Object.keys(BRAND_LAYERS.rounded.tokens).length, 2);
});


// ========================= THEMER BUILD =================================== //

test('buildTheme with white scheme produces 380 tokens', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(Object.keys(built.tokens).length, 380);
});

test('buildTheme with white scheme produces no violations', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.deepEqual(built.violations || [], []);
});

test('buildTheme with white scheme produces no corrections', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.deepEqual(built.corrections || [], []);
});

test('buildTheme with white scheme produces color.interactive #0f62fe', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(built.tokens['color.interactive'], '#0f62fe');
});

test('buildTheme with white + tasks brand overrides color.interactive to #4f46e5', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer, BRAND_LAYERS.tasks], 'native');
  assert.equal(built.tokens['color.interactive'], '#4f46e5');
});

test('buildTheme with white + tasks brand overrides color.button_primary to #4f46e5', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer, BRAND_LAYERS.tasks], 'native');
  assert.equal(built.tokens['color.button_primary'], '#4f46e5');
});

test('buildTheme with white + tasks brand overrides shape.radius_04 to 8', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer, BRAND_LAYERS.tasks], 'native');
  assert.equal(built.tokens['shape.radius_04'], 8);
});

test('buildTheme with white + notes brand overrides color.interactive to #0d9488', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer, BRAND_LAYERS.notes], 'native');
  assert.equal(built.tokens['color.interactive'], '#0d9488');
});

test('buildTheme with white scheme preserves color.background #ffffff', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(built.tokens['color.background'], '#ffffff');
});

test('buildTheme with g100 scheme produces color.background #161616', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const g100Tokens = profile.schemes.g100.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: g100Tokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  assert.equal(built.tokens['color.background'], '#161616');
});


// ========================= BUILD SYSTEM =================================== //

test('buildSystem produces a system with Component and Style', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  const result = buildSystem(Lib, built, [baseLayer], null, null, null, 'base');
  assert.ok(result.system);
  assert.ok(result.system.Component);
  assert.ok(result.system.Style);
  assert.ok(result.theme);
});

test('buildSystem produces flat token map as theme', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  const result = buildSystem(Lib, built, [baseLayer], null, null, null, 'base');
  assert.equal(result.theme['color.interactive'], '#0f62fe');
  assert.equal(result.theme['color.background'], '#ffffff');
});

test('buildSystem with tasks brand produces interactive #4f46e5', function () {
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer, BRAND_LAYERS.tasks], 'native');
  const result = buildSystem(Lib, built, [baseLayer, BRAND_LAYERS.tasks], null, null, null, 'base');
  assert.equal(result.theme['color.interactive'], '#4f46e5');
});


// ========================= FONT LOOP GUARD (C1) =========================== //

// Because ATTEMPTED is module scope, these tests share state. Use a distinct
// family name per test rather than trying to reset the ledger.

test('should attempt a font load once per family across multiple buildSystem calls', function () {
  const familyName = 'TestOnceOnly-' + Math.random().toString(36).slice(2);
  let loadCount = 0;
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return false;
      },
      resolveFamily: function () {
        return { success: true, family: 'System' };
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
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  // Override the theme's font family to our test family
  built.tokens['font.family.sans'] = familyName;
  for (let i = 0; i < 5; i++) {
    buildSystem(stubLib, built, [baseLayer], function () {}, null, null, 'base');
  }
  assert.equal(loadCount, 1);
});

test('should not re-derive when the family stays unregistered', function () {
  const familyName = 'TestNoRederive-' + Math.random().toString(36).slice(2);
  let deriveCount = 0;
  const rederive = function () {
    deriveCount++;
  };
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return false;
      },
      resolveFamily: function () {
        return { success: true, family: 'System' };
      }
    },
    Fonts: {
      loadFamily: function () {
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  built.tokens['font.family.sans'] = familyName;
  buildSystem(stubLib, built, [baseLayer], rederive, null, null, 'base');
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
  const rederive = function () {
    deriveCount++;
  };
  const stubLib = Object.assign({}, Lib, {
    Font: {
      isRegistered: function () {
        return registered;
      },
      resolveFamily: function () {
        return { success: true, family: registered ? familyName : 'System' };
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
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  built.tokens['font.family.sans'] = familyName;
  buildSystem(stubLib, built, [baseLayer], rederive, null, null, 'base');
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
      },
      resolveFamily: function () {
        return { success: true, family: 'System' };
      }
    },
    Fonts: {
      loadFamily: function () {
        return Promise.resolve({ success: true });
      }
    },
    Debug: { warn: function () {} }
  });
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');
  built.tokens['font.family.sans'] = familyName;
  const result = buildSystem(stubLib, built, [baseLayer], null, null, null, 'base');
  assert.equal(result.theme['font.family.sans'], 'System');
});
