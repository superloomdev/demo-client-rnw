// Info: Test fixture loader. Builds { Component, CommonStyle, theme, Lib } for
// the test suites. The only fixture file tests import. Calls the real app
// loader with stub adapters, proving the test tier is just another host.
'use strict';

const React = require('react');

// Stub adapters (the test tier is a host)
const navigationAdapter = require('./adapters/navigation');
const iconsAdapter = require('./adapters/icons');
const fontsAdapter = require('./adapters/fonts');

// Call the real loader
const { Lib } = require('../app-core/loader')({
  Navigation: navigationAdapter,
  Icons: iconsAdapter,
  Fonts: fontsAdapter
});

// Build the assembled theme from the base scheme via the themer
const themerTemplate = require('../themes/themer-template');
const themerBridge = require('../themes/themer-bridge');
const { assemble } = require('../themes/assemble');

const baseLayer = themerBridge.schemeToLayer(Lib.Themes.base, 'base');
const built = Lib.Themer.buildTheme(themerTemplate, [baseLayer], 'native');
const assembled = assemble(Lib, built, [baseLayer], null);
const theme = assembled.theme;

module.exports = {
  Lib: Lib,
  theme: theme,
  Component: assembled.Component,
  CommonStyle: assembled.CommonStyle,
  React: React
};
