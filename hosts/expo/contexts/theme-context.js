// Info: Theme context — the runtime-theming hub for the host app. Given a shape's
// VARIANT (partial overrides) it assembles the theme from the host base + variant
// via the injected Themer (native layer cascade), builds the themed component
// library (combineComponent), and provides { theme, Component, CommonStyle,
// updateTheme } to the subtree. Calling updateTheme(nextVariant) re-derives
// everything live (the "shuffle accent" button uses this).
//
// Loader pattern: SINGLETON with dependency injection. React arrives via
// Lib.React (no top-level require('react')), the themer via Lib.Themer, and the
// base scheme via Lib.Themes.base. The context object is created once in the
// loader; Node's require cache guarantees one per process. The public interface
// (Extension) is populated by the loader and returned, so consumers use
// Lib.ThemeContext.* rather than requiring this file.
'use strict';


// Injected dependencies + module state, set by the loader (module-scope).
let Lib;              // shared_libs container (requires Lib.React, Lib.Themer, Lib.Themes)
let React;            // injected React (required)
let baseScheme;       // complete fallback scheme (Lib.Themes.base)
let combineComponent; // themed component-library builder (src/components)
let ThemeContext;     // React context object, created once in loader
let themerTemplate;   // themer template for Nimbus tokens
let themerBridge;     // bridge functions for scheme <-> themer conversion


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects React + Themer + base scheme via Lib, builds
the React context once, and returns the provider/hooks interface.

@param {Object} shared_libs - Lib container; requires React, Themer, Themes

@return {Object} - { ThemeProvider, useThemeController, useTheme, useStyles,
                     useComponents, ThemeContext }
*********************************************************************/
module.exports = function loader (shared_libs) {

  // Capture injected deps
  Lib = shared_libs || {};

  // React is required — injected via Lib to keep the centralized-React pattern
  React = Lib.React;
  if (!React) {
    throw new Error('theme-context: Lib.React is required (inject React via the loader).');
  }

  // The complete base scheme comes from the theme registry
  baseScheme = (Lib.Themes && Lib.Themes.base) || {};

  // The themer template and bridge are host code (idiomatic require is fine)
  themerTemplate = require('../themes/themer-template');
  themerBridge = require('../themes/themer-bridge');

  // The component-library builder is host code (idiomatic require is fine).
  // Components live at hosts/expo/components/ - one directory up from contexts/.
  // Create the context once and expose it on the interface
  ThemeContext = React.createContext(null);
  Extension.ThemeContext = ThemeContext;

  return Extension;

};/////////////////////////// Module-Loader END ////////////////////////////////



/////////////////////////// Public Functions START /////////////////////////////
const Extension = { // Public theming interface accessible by the host


  // ~~~~~~~~~~ Context ~~~~~~~~~~
  // React context object (advanced use / custom consumers). Assigned by loader.

  ThemeContext: null,


  // ~~~~~~~~~~ Provider ~~~~~~~~~~

  /********************************************************************
  ThemeProvider — assembles a theme from base + the shape variant, builds the
  themed component library, and provides them to the subtree. State-backed so
  updateTheme(nextVariant) re-derives everything live.

  @param {Object} props          - React props
  @param {Object} props.variant  - the shape's partial override values (optional)
  @param {Node}   props.children - subtree to provide the theme to

  @return {Object} - React element
  *********************************************************************/
  ThemeProvider: function (props) {

    // Current shape variant (stateful so updateTheme can change it live)
    const [variant, setVariant] = React.useState(props.variant || {});

    // Re-assemble theme + components only when the variant changes
    const value = React.useMemo(function () {

      // Themer native layer cascade: base layer first, variant layer overrides.
      // This replaces the old Styler.extend() merge — Themer handles the
      // layering natively via buildTheme(template, [layers], platform).
      const baseLayer = themerBridge.schemeToLayer(baseScheme, 'base');
      const variantLayer = themerBridge.schemeToLayer(variant, 'variant');
      const built = Lib.Themer.buildTheme(themerTemplate, [baseLayer, variantLayer], 'native');
      const theme = themerBridge.bridgeTheme(built.tokens);

      // Build the themed component library from the app's component source
      if (!combineComponent) {
        combineComponent = require('../components');
      }
      const components = combineComponent(Lib, theme);
      return {
        Lib: Lib,
        theme: theme,
        Component: components.Component,
        CommonStyle: components.CommonStyle,
        updateTheme: setVariant
      };
    }, [variant]);

    return React.createElement(ThemeContext.Provider, { value: value }, props.children);

  },


  // ~~~~~~~~~~ Hooks ~~~~~~~~~~

  /********************************************************************
  Hook: the full controller — { Lib, theme, Component, CommonStyle, updateTheme }.

  @return {Object|null} - context value, or null when outside a provider
  *********************************************************************/
  useThemeController: function () {
    return React.useContext(ThemeContext);
  },


  /********************************************************************
  Hook: the assembled theme — { Color, Dimension, Font }.

  @return {Object|null} - the theme, or null when outside a provider
  *********************************************************************/
  useTheme: function () {
    const ctx = React.useContext(ThemeContext);
    return ctx ? ctx.theme : null;
  },


  /********************************************************************
  Hook: the generated atomic utility stylesheet (CommonStyle).

  @return {Object|null} - the styles, or null when outside a provider
  *********************************************************************/
  useStyles: function () {
    const ctx = React.useContext(ThemeContext);
    return ctx ? ctx.CommonStyle : null;
  },


  /********************************************************************
  Hook: the themed component library (atoms / molecules / variants).

  @return {Object|null} - the Component registry, or null when outside a provider
  *********************************************************************/
  useComponents: function () {
    const ctx = React.useContext(ThemeContext);
    return ctx ? ctx.Component : null;
  }


};/////////////////////////// Public Functions END //////////////////////////////
