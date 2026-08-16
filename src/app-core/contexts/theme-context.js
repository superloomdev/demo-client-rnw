// Info: Theme context — the runtime-theming hub for the host app.
//
// This file is reference code. It demonstrates the
// module/app split: the extension module (helper-themer-ext-react) owns the
// generic React plumbing (context, provider, hooks, live update). This file
// owns the app-specific logic that runs inside the extension's transform seam:
//
//   1. Convert the shape variant to themer layers (base + variant).
//   2. Bridge the themer's flat token map to { Color, Dimension, Font }.
//   3. Validate font families against the font core registry (async re-derive).
//   4. Build the themed component library (combineComponent).
//
// The public surface is unchanged from the previous standalone version:
//   ThemeProvider, useThemeController, useTheme, useStyles, useComponents,
//   ThemeContext. No screen changes are needed.
//
// Loader pattern: SINGLETON. The extension factory is called once in the
// common loader (Lib.ThemerReact). This file wraps the extension's interface
// with app-specific logic and returns the wrapper. Consumers use
// Lib.ThemeContext.* rather than requiring this file.
'use strict';


// Injected dependencies + module state, set by the loader (module-scope).
let Lib;              // Lib container (requires React, Themer, ThemerReact, Themes, Fonts)
let React;            // injected React (required)
let Ext;              // themer-ext-react instance (required)
let baseScheme;       // complete fallback scheme (Lib.Themes.base)
let themerTemplate;   // themer template for Nimbus tokens
let themerBridge;     // bridge functions for scheme <-> themer conversion
let assemble;         // theme assembly function (src/themes/assemble)
let derivePlatform;   // platform derivation function (src/themes/assemble)


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects React + Themer extension + base scheme via Lib,
exposes the extension's context, and returns the provider/hooks wrapper.

@param {Object} shared_libs - Lib container; requires React, ThemerReact, Themes, Fonts

@return {Object} - { ThemeProvider, useThemeController, useTheme, useStyles,
                     useComponents, ThemeContext }
*********************************************************************/
module.exports = function loader (shared_libs) {

  // Capture injected deps
  Lib = shared_libs || {};

  // React is required — injected via Lib to keep the centralized-React pattern
  React = Lib.React;
  if (!React) {
    throw new TypeError('theme-context: Lib.React is required (inject React via the loader).');
  }

  // The themer-ext-react extension instance is required
  Ext = Lib.ThemerReact;
  if (!Ext) {
    throw new TypeError('theme-context: Lib.ThemerReact is required (inject the themer-ext-react extension via the loader).');
  }

  // The complete base scheme comes from the theme registry
  baseScheme = (Lib.Themes && Lib.Themes.base) || {};

  // The themer template, bridge, and assembly are host code
  themerTemplate = require('../../themes/themer-template');
  themerBridge = require('../../themes/themer-bridge');
  const assembleModule = require('../../themes/assemble');
  assemble = assembleModule.assemble;
  derivePlatform = assembleModule.platform;

  // Expose the extension's context for advanced consumers
  Extension.ThemeContext = Ext.ThemeContext;

  return Extension;

};/////////////////////////// Module-Loader END ////////////////////////////////



/////////////////////////// Public Functions START /////////////////////////////
const Extension = { // Public theming interface accessible by the host


  // ~~~~~~~~~~ Context ~~~~~~~~~~
  // React context object from the extension (advanced use / custom consumers).
  // Assigned by the loader.

  ThemeContext: null,


  // ~~~~~~~~~~ Provider ~~~~~~~~~~

  /********************************************************************
  ThemeProvider — wraps the extension's ThemeProvider with app-specific
  logic. Converts the shape variant to themer layers, passes them through
  the extension's transform seam (bridging, font validation, component
  building), and provides the result to the subtree.

  The extension holds the layers in React state; updateTheme (exposed via
  useThemeController) converts a new variant to layers and calls the
  extension's update_layers to trigger a live re-derive.

  @param {Object} props          - React props
  @param {Object} props.variant  - the shape's partial override values (optional)
  @param {Node}   props.children - subtree to provide the theme to

  @return {Object} - React element
  *********************************************************************/
  ThemeProvider: function (props) {

    // Ref to capture the extension's update_layers setter from context.
    // The transform function closes over this ref so it can trigger a
    // re-derive when an async font load completes.
    const updateLayersRef = React.useRef(null);

    // Convert the shape variant to themer layers: base layer first, then
    // variant overrides. This replaces the old Styler.extend() merge.
    const baseLayer = themerBridge.schemeToLayer(baseScheme, 'base');
    const variantLayer = themerBridge.schemeToLayer(props.variant || {}, 'variant');
    const layers = [baseLayer, variantLayer];

    // Transform seam: runs inside the extension's useMemo. Delegates to
    // the shared assemble function so the bridging, font validation, and
    // component building logic lives in one place.
    const transform = React.useCallback(function (built, currentLayers) {
      return assemble(Lib, built, currentLayers, updateLayersRef);
    }, []);

    // Hidden child that captures the extension's update_layers into the ref.
    // Renders inside the extension's ThemeProvider so it can read the context.
    function RefCapture () {
      const ctx = Ext.useThemeController();
      updateLayersRef.current = ctx ? ctx.update_layers : null;
      return null;
    }

    // Render the extension's ThemeProvider with the app-specific transform
    return React.createElement(Ext.ThemeProvider, {
      template: themerTemplate,
      layers: layers,
      platform: derivePlatform(Lib),
      transform: transform
    }, [
      React.createElement(RefCapture, { key: '__ref_capture' }),
      props.children
    ]);

  },


  // ~~~~~~~~~~ Hooks ~~~~~~~~~~

  /********************************************************************
  Hook: the full controller — { Lib, theme, Component, CommonStyle,
  updateTheme }. Wraps the extension's context with the app-shaped API.
  updateTheme(nextVariant) converts the variant to layers and calls the
  extension's update_layers for a live re-derive.

  @return {Object|null} - context value, or null when outside a provider
  *********************************************************************/
  useThemeController: function () {
    const ctx = Ext.useThemeController();
    if (!ctx) {
      return null;
    }

    return {
      Lib: Lib,
      theme: ctx.theme,
      Component: ctx.Component,
      CommonStyle: ctx.CommonStyle,
      updateTheme: function (nextVariant) {
        const baseLayer = themerBridge.schemeToLayer(baseScheme, 'base');
        const variantLayer = themerBridge.schemeToLayer(nextVariant, 'variant');
        ctx.update_layers([baseLayer, variantLayer]);
      }
    };
  },


  /********************************************************************
  Hook: the assembled theme — { Color, Dimension, Font }.

  @return {Object|null} - the theme, or null when outside a provider
  *********************************************************************/
  useTheme: function () {
    const ctx = Ext.useThemeController();
    return ctx ? ctx.theme : null;
  },


  /********************************************************************
  Hook: the generated atomic utility stylesheet (CommonStyle).

  @return {Object|null} - the styles, or null when outside a provider
  *********************************************************************/
  useStyles: function () {
    const ctx = Ext.useThemeController();
    return ctx ? ctx.CommonStyle : null;
  },


  /********************************************************************
  Hook: the themed component library (atoms / molecules / variants).

  @return {Object|null} - the Component registry, or null when outside a provider
  *********************************************************************/
  useComponents: function () {
    const ctx = Ext.useThemeController();
    return ctx ? ctx.Component : null;
  }


};/////////////////////////// Public Functions END //////////////////////////////
