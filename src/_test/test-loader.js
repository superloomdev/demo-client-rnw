// Info: L1 - Loader contract tests. Verifies the test-tier loader produces
// a Lib container with the expected shape (Utils, Debug, Client, Themer,
// ThemerReact, Font, Fonts, Themes, Icons, Navigation, ThemeContext), a
// complete theme with Color/Dimension/Font, and a Component registry with
// the app's atom and molecule set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import loader from './loader.js';

const { Lib, theme, Component, CommonStyle } = loader();

// Lib container structure
test('Lib has Utils, Debug, Client, React, Themer, ThemerReact, Font, Fonts, Themes, ThemeContext', function () {
  assert.equal(typeof Lib.Utils, 'object');
  assert.equal(typeof Lib.Debug, 'object');
  assert.equal(typeof Lib.Client, 'object');
  assert.equal(typeof Lib.React, 'object');
  assert.equal(typeof Lib.Themer, 'object');
  assert.equal(typeof Lib.ThemerReact, 'object');
  assert.equal(typeof Lib.Font, 'object');
  assert.equal(typeof Lib.Fonts, 'object');
  assert.equal(typeof Lib.Schemes, 'object');
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

// Theme structure
test('theme has Color, Dimension, Font', function () {
  assert.equal(typeof theme.Color, 'object');
  assert.equal(typeof theme.Dimension, 'object');
  assert.equal(typeof theme.Font, 'object');
});

test('theme.Color.APP_PRIMARY is #4f46e5', function () {
  assert.equal(theme.Color.APP_PRIMARY, '#4f46e5');
});

test('theme.Color.TEXT_ON_PRIMARY is #ffffff (derived from indigo)', function () {
  assert.equal(theme.Color.TEXT_ON_PRIMARY, '#ffffff');
});

test('theme.Dimension.fontSize.md is 16', function () {
  assert.equal(theme.Dimension.fontSize.md, 16);
});

test('theme.Dimension.fontSize.xs is 11', function () {
  assert.equal(theme.Dimension.fontSize.xs, 11);
});

test('theme.Dimension.space.md is 12 (miniUnit 4 * multiplier 3)', function () {
  assert.equal(theme.Dimension.space.md, 12);
});

test('theme.Dimension.radius.lg is 12', function () {
  assert.equal(theme.Dimension.radius.lg, 12);
});

test('theme.Font.family.primary is System', function () {
  assert.equal(theme.Font.family.primary, 'System');
});

test('theme.Font.weight.bold is 700', function () {
  assert.equal(theme.Font.weight.bold, '700');
});

// Component registry
test('Component has View, Text, Icon, TextInput, Card, ButtonPrimary', function () {
  assert.equal(typeof Component.View, 'function');
  assert.equal(typeof Component.Text, 'function');
  assert.equal(typeof Component.Icon, 'function');
  assert.equal(typeof Component.TextInput, 'function');
  assert.equal(typeof Component.Card, 'function');
  assert.equal(typeof Component.ButtonPrimary, 'function');
});

test('Component.variant has ButtonPrimaryTypeA', function () {
  assert.equal(typeof Component.variant.ButtonPrimaryTypeA, 'function');
});

test('Component.freeform has RawBox', function () {
  assert.equal(typeof Component.freeform.RawBox, 'function');
});

// CommonStyle
test('CommonStyle has font_size_md with fontSize 16', function () {
  assert.equal(CommonStyle.font_size_md.fontSize, 16);
});

test('CommonStyle has background_app_primary with correct color', function () {
  assert.equal(CommonStyle.background_app_primary.backgroundColor, '#4f46e5');
});

test('CommonStyle has br_md with borderRadius 8', function () {
  assert.equal(CommonStyle.br_md.borderRadius, 8);
});
