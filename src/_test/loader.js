// Info: Test-tier composition root. Builds the full Lib container with stub
// adapters, assembles a themed component set, and builds the standard
// component registry. The test tier is a host - it uses the real loader,
// never rebuilds the container.
//
// Compatibility: Node.js 24+, react-test-renderer.
import appLoader from '../app-core/loader.js';
import navigationAdapter from './adapters/navigation.js';
import iconsAdapter from './adapters/icons.js';
import fontsAdapter from './adapters/fonts.js';
import deviceAdapter from './adapters/device.js';
import { buildSystem } from '../themes/build-system.js';
import buttonPrimaryTypeA from '../components/variant/buttonPrimaryTypeA.js';
import rawBox from '../components/freeform/rawBox.js';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';


/********************************************************************
Test loader. Builds the Lib container through the real app-core loader
with stub adapters, then builds the standard component system for testing.

@return {Object} - { Lib, theme, Component, CommonStyle,
                     CarbonComponent, CarbonStyle, React, TestRenderer, act }
*********************************************************************/
export default function loader () {

  // Stub adapters (the test tier is a host)

  // Call the real loader - same as Expo and web hosts
  const { Lib } = appLoader({
    Navigation: navigationAdapter,
    Icons: iconsAdapter,
    Fonts: fontsAdapter
  });

  // Build the theme from the Carbon white scheme via the themer
  const profile = Lib.Themes.profile;
  const whiteTokens = profile.schemes.white.tokens;
  const template = { tokens: whiteTokens };
  const baseLayer = { name: 'base', tokens: whiteTokens };
  const built = Lib.Themer.buildTheme(template, [baseLayer], 'native');

  // Build the standard component system through build-system.js.
  // buildSystem registers the full package roster plus local variants/freeforms.
  const Device = deviceAdapter(Lib, {});
  Lib.Device = Device;
  const result = buildSystem(
    Lib, built, [baseLayer], null,
    { ButtonPrimaryTypeA: buttonPrimaryTypeA },
    { RawBox: rawBox },
    'base'
  );
  const theme = result.theme;
  const system = result.system;

  // Return runtime objects
  return {
    Lib: Lib,
    theme: theme,
    Component: system.Component,
    CommonStyle: system.Style.utilities,
    React: React,
    TestRenderer: TestRenderer,
    act: act
  };

}
