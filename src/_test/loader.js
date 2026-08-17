// Info: Test-tier composition root. Builds the full Lib container with stub
// adapters, assembles a themed component set, and builds the Carbon registry.
// The test tier is a host - it uses the real loader, never rebuilds the container.
//
// Compatibility: Node.js 24+, react-test-renderer.
'use strict';


/********************************************************************
Test loader. Builds the Lib container through the real app-core loader
with stub adapters, then assembles the Carbon registry for testing.

@return {Object} - { Lib, Config, theme, Component, CommonStyle,
                     CarbonComponent, CarbonStyle, React, TestRenderer }
*********************************************************************/
module.exports = function loader () {

  // Stub adapters (the test tier is a host)
  const navigationAdapter = require('./adapters/navigation');
  const iconsAdapter = require('./adapters/icons');
  const fontsAdapter = require('./adapters/fonts');
  const deviceAdapter = require('./adapters/device');

  // Call the real loader - same as Expo and web hosts
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

  // Build the full Carbon registry (same pattern as useCarbonRegistry)
  const BREAKPOINTS = Object.freeze({
    base: 0,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280
  });
  const contract = Object.assign({}, theme, { Breakpoint: BREAKPOINTS });

  // Instantiate the Carbon factory with the full shared_libs set
  const Device = deviceAdapter(Lib, {});
  const CarbonComponents = Lib.CarbonComponents({
    Utils: Lib.Utils,
    Debug: Lib.Debug,
    React: Lib.React,
    Device: Device,
    Icons: Lib.Icons,
    Font: Lib.Font
  }, {});
  const carbonBuilt = CarbonComponents.build(contract, 'base');

  // Return runtime objects
  return {
    Lib: Lib,
    theme: theme,
    Component: assembled.Component,
    CommonStyle: assembled.CommonStyle,
    CarbonComponent: carbonBuilt.Component,
    CarbonStyle: carbonBuilt.Style,
    React: require('react'),
    TestRenderer: require('react-test-renderer')
  };

};
