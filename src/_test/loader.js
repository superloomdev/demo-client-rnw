// Info: Test-tier composition root. Builds the full Lib container with stub
// adapters, assembles a themed component set, and builds the Carbon registry.
// The test tier is a host - it uses the real loader, never rebuilds the container.
//
// Compatibility: Node.js 24+, react-test-renderer.
import appLoader from '../app-core/loader.js';
import navigationAdapter from './adapters/navigation.js';
import iconsAdapter from './adapters/icons.js';
import fontsAdapter from './adapters/fonts.js';
import deviceAdapter from './adapters/device.js';
import themerTemplate from '../themes/themer-template.js';
import themerBridge from '../themes/themer-bridge.js';
import { assemble } from '../themes/assemble.js';
import React from 'react';
import TestRenderer from 'react-test-renderer';


/********************************************************************
Test loader. Builds the Lib container through the real app-core loader
with stub adapters, then assembles the Carbon registry for testing.

@return {Object} - { Lib, Config, theme, Component, CommonStyle,
                     CarbonComponent, CarbonStyle, React, TestRenderer }
*********************************************************************/
export default function loader () {

  // Stub adapters (the test tier is a host)

  // Call the real loader - same as Expo and web hosts
  const { Lib } = appLoader({
    Navigation: navigationAdapter,
    Icons: iconsAdapter,
    Fonts: fontsAdapter
  });

  // Build the assembled theme from the base scheme via the themer
  const baseLayer = themerBridge.schemeToLayer(Lib.Schemes.neutral, 'base');
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

  // Build a Carbon system with the full shared_libs set, then register the
  // whole roster - the suite walks every namespace, same as the showcase
  const Device = deviceAdapter(Lib, {});
  const carbonSystem = Lib.CarbonComponents.createSystem({
    Utils: Lib.Utils,
    Debug: Lib.Debug,
    React: Lib.React,
    Device: Device,
    Icons: Lib.Icons,
    Font: Lib.Font
  }, {}, contract, 'base');

  const carbonRoster = Lib.CarbonComponents.roster;

  carbonSystem.addComponents(carbonRoster.COMPONENTS);
  carbonSystem.addVariants(carbonRoster.VARIANTS);
  carbonSystem.addFreeforms(carbonRoster.FREEFORMS);
  carbonSystem.addProviders(carbonRoster.PROVIDERS);

  // Return runtime objects
  return {
    Lib: Lib,
    theme: theme,
    Component: assembled.Component,
    CommonStyle: assembled.CommonStyle,
    CarbonComponent: carbonSystem.Component,
    CarbonStyle: carbonSystem.Style,
    React: React,
    TestRenderer: TestRenderer
  };

}
