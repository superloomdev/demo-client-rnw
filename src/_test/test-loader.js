// Info: L1 - Loader contract tests. Verifies the test-tier loader produces
// a Lib container with the expected shape (Utils, Debug, Client, Themer,
// ThemerReact, Font, Fonts, Themes, Components, Device, Icons, Navigation,
// ThemeContext), a flat token map, and a Component registry built
// from the published rnw-components package.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import loader from './loader.js';

const { Lib, theme, Component, CommonStyle } = loader();

// Lib container structure
test('Lib has Utils, Debug, Client, React, Themer, ThemerReact, Font, Fonts, Themes, Components, Device, ThemeContext', function () {
  assert.equal(typeof Lib.Utils, 'object');
  assert.equal(typeof Lib.Debug, 'object');
  assert.equal(typeof Lib.Client, 'object');
  assert.equal(typeof Lib.React, 'object');
  assert.equal(typeof Lib.Themer, 'object');
  assert.equal(typeof Lib.ThemerReact, 'object');
  assert.equal(typeof Lib.Font, 'object');
  assert.equal(typeof Lib.Fonts, 'object');
  assert.equal(typeof Lib.Themes, 'object');
  assert.equal(typeof Lib.Components, 'object');
  assert.equal(typeof Lib.Device, 'object');
  assert.equal(typeof Lib.ThemeContext, 'object');
});

test('Lib.Client.os returns web under react-native-web', function () {
  assert.equal(Lib.Client.os(), 'web');
  assert.equal(Lib.Client.isBrowser(), true);
  assert.equal(Lib.Client.isNative(), false);
});

test('Lib.Icons.Glyph is a function (injected)', function () {
  assert.equal(typeof Lib.Icons.Glyph, 'function');
});

test('Lib.Navigation has Link and Redirect (injected)', function () {
  assert.equal(typeof Lib.Navigation.Link, 'function');
  assert.equal(typeof Lib.Navigation.Redirect, 'function');
});

test('Lib.Fonts.families includes System', function () {
  assert.ok(Lib.Fonts.families.indexOf('System') !== -1);
});

test('Lib.Fonts.isReady returns true (stub adapter)', function () {
  assert.equal(Lib.Fonts.isReady(), true);
});

test('Lib.Themes has Carbon profile with white, g10, g90, g100 schemes', function () {
  assert.ok(Lib.Themes.profiles.carbon);
  assert.ok(Lib.Themes.profiles.carbon.schemes.white);
  assert.ok(Lib.Themes.profiles.carbon.schemes.g10);
  assert.ok(Lib.Themes.profiles.carbon.schemes.g90);
  assert.ok(Lib.Themes.profiles.carbon.schemes.g100);
});

test('Lib.Themes has Material profile with light and dark schemes', function () {
  assert.ok(Lib.Themes.profiles.material);
  assert.ok(Lib.Themes.profiles.material.schemes.light);
  assert.ok(Lib.Themes.profiles.material.schemes.dark);
});

test('Lib.Themes has base profile with light and dark schemes', function () {
  assert.ok(Lib.Themes.profiles.base);
  assert.ok(Lib.Themes.profiles.base.schemes.light);
  assert.ok(Lib.Themes.profiles.base.schemes.dark);
});

test('Lib.Themes has brand layers for tasks and notes', function () {
  assert.ok(Lib.Themes.brands.tasks);
  assert.ok(Lib.Themes.brands.notes);
  assert.equal(Lib.Themes.brands.tasks.tokens['color.interactive'], '#4f46e5');
  assert.equal(Lib.Themes.brands.notes.tokens['color.interactive'], '#0d9488');
});

// Theme structure (flat token map)
test('theme is a flat token map with dotted keys', function () {
  assert.equal(typeof theme, 'object');
  assert.ok(theme['color.background']);
  assert.ok(theme['color.text_primary']);
  assert.ok(theme['color.interactive']);
  assert.ok(theme['shape.radius_04']);
});

test('theme color.interactive is Carbon Blue 60 (#0f62fe) under white scheme', function () {
  assert.equal(theme['color.interactive'], '#0f62fe');
});

test('theme color.background is #ffffff under white scheme', function () {
  assert.equal(theme['color.background'], '#ffffff');
});

test('theme color.text_primary is #161616 under white scheme', function () {
  assert.equal(theme['color.text_primary'], '#161616');
});

test('theme shape.radius_04 is 4 under white scheme', function () {
  assert.equal(theme['shape.radius_04'], 4);
});

test('theme font.family.sans falls back to System (IBM Plex Sans not registered)', function () {
  assert.equal(theme['font.family.sans'], 'System');
});

// Component registry
test('Component has View, Text, Icon, TextInput, Button, Tile', function () {
  assert.equal(typeof Component.View, 'function');
  assert.equal(typeof Component.Text, 'function');
  assert.equal(typeof Component.Icon, 'function');
  assert.equal(typeof Component.TextInput, 'function');
  assert.equal(typeof Component.Button, 'function');
  assert.equal(typeof Component.Tile, 'function');
});

test('Component.variant has ButtonPrimaryTypeA', function () {
  assert.equal(typeof Component.variant.ButtonPrimaryTypeA, 'function');
});

test('Component.freeform has RawBox', function () {
  assert.equal(typeof Component.freeform.RawBox, 'function');
});

// CommonStyle (utility stylesheet)
test('CommonStyle has type_body01 with fontSize', function () {
  assert.ok(CommonStyle['type_body01'].fontSize);
});

test('CommonStyle has background_interactive with backgroundColor', function () {
  assert.ok(CommonStyle['background_interactive'].backgroundColor);
});

test('CommonStyle has br_radius_04 with borderRadius 4', function () {
  assert.equal(CommonStyle['br_radius_04'].borderRadius, 4);
});
