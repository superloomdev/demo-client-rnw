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

test('carbon-scheme builds through the themer with all 22 required tokens', function () {
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
    'STATUS_INFO', 'STATUS_INFO_SUBTLE'
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
