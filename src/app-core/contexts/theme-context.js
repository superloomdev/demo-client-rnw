// Info: Theme context - the runtime-theming hub for the host app.
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
import themerTemplate from '../../themes/themer-template.js';
import themerBridge from '../../themes/themer-bridge.js';
import { assemble, platform as derivePlatform } from '../../themes/assemble.js';


// Injected dependencies + module state, set by the loader (module-scope).
let Lib;              // Lib container (requires React, Themer, ThemerReact, Themes, Fonts)
let React;            // injected React (required)
let Ext;              // themer-ext-react instance (required)
let baseScheme;       // complete fallback scheme (Lib.Schemes.neutral)


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects React + Themer extension + base scheme via Lib,
exposes the extension's context, and returns the provider/hooks wrapper.

@param {Object} shared_libs - Lib container; requires React, ThemerReact, Themes, Fonts

@return {Object} - { ThemeProvider, useThemeController, useTheme, useStyles,
                     useComponents, ThemeContext }
*********************************************************************/
export default function loader (shared_libs) {

  // Capture injected deps
  Lib = shared_libs || {};

  // React is required - injected via Lib to keep the centralized-React pattern
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
  baseScheme = (Lib.Schemes && Lib.Schemes.neutral) || {};

  // Expose the extension's context for advanced consumers
  Extension.ThemeContext = Ext.ThemeContext;

  // Return the public theming interface for consumers
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
  ThemeProvider - wraps the extension's ThemeProvider with app-specific
  logic. Converts the shape variant to themer layers, passes them through
  the extension's transform seam (bridging, font validation, component
  building), and provides the result to the subtree.

  The extension holds the layers in React state; updateTheme (exposed via
  useThemeController) converts a new variant to layers and calls the
  extension's update_layers to trigger a live re-derive.

  @param {Object} props          - React props
  @param {Object} props.scheme   - complete token set replacing the neutral
                                   base (optional; defaults to neutral)
  @param {Object} props.variant  - the shape's partial override values (optional)
  @param {Node}   props.children - subtree to provide the theme to

  @return {Object} - React element
  *********************************************************************/
  ThemeProvider: function (props) {

    // Ref to capture the extension's update_layers setter from context.
    // The transform function closes over this ref so it can trigger a
    // re-derive when an async font load completes.
    const updateLayersRef = React.useRef(null);

    // A scheme is a complete token set and replaces the base outright; the
    // neutral scheme is the fallback when the host names none.
    const scheme = props.scheme || baseScheme;

    // Convert the scheme + shape variant to themer layers: scheme first,
    // then variant overrides. This replaces the old Styler.extend() merge.
    const baseLayer = themerBridge.schemeToLayer(scheme, 'base');
    const variantLayer = themerBridge.schemeToLayer(props.variant || {}, 'variant');
    const layers = [baseLayer, variantLayer];

    // Transform seam: runs inside the extension's useMemo. Delegates to
    // the shared assemble function so the bridging, font validation, and
    // component building logic lives in one place.
    const transform = React.useCallback(function (built, currentLayers) {
      // Return the assembled theme via the shared transform seam
      return assemble(Lib, built, currentLayers, updateLayersRef);
    }, []);

    // Hidden child that captures the extension's update_layers into the ref.
    // Renders inside the extension's ThemeProvider so it can read the context.
    function RefCapture () {
      // Read the extension controller so we can capture its update setter
      const ctx = Ext.useThemeController();
      updateLayersRef.current = ctx ? ctx.update_layers : null;
      // Return nothing so this hidden child renders no output
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
  Hook: the full controller - { Lib, theme, Component, CommonStyle,
  updateTheme, updateScheme }. Wraps the extension's context with the
  app-shaped API. updateTheme(nextVariant) overlays a partial variant on the
  neutral base; updateScheme(nextScheme) replaces the base outright. Both
  call the extension's update_layers for a live re-derive.

  @return {Object|null} - context value, or null when outside a provider
  *********************************************************************/
  useThemeController: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    if (!ctx) {
      // Return null when used outside a provider
      return null;
    }

    // Return the app-shaped controller wrapping the extension context
    return {
      Lib: Lib,
      theme: ctx.theme,
      Component: ctx.Component,
      CommonStyle: ctx.CommonStyle,
      updateTheme: function (nextVariant) {
        // Convert the variant to layers and trigger a live re-derive
        const baseLayer = themerBridge.schemeToLayer(baseScheme, 'base');
        const variantLayer = themerBridge.schemeToLayer(nextVariant, 'variant');
        ctx.update_layers([baseLayer, variantLayer]);
      },
      updateScheme: function (nextScheme) {
        // Replace the base outright and re-derive with no variant on top.
        // A scheme is a complete token set; a variant is a partial overlay.
        // The extension holds the layers in React state, so the swap survives
        // re-renders without any module-scope state of its own.
        const schemeLayer = themerBridge.schemeToLayer(nextScheme, 'base');
        ctx.update_layers([schemeLayer]);
      }
    };
  },


  /********************************************************************
  Hook: the assembled theme - { Color, Dimension, Font }.

  @return {Object|null} - the theme, or null when outside a provider
  *********************************************************************/
  useTheme: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    // Return the assembled theme or null when outside a provider
    return ctx ? ctx.theme : null;
  },


  /********************************************************************
  Hook: the generated atomic utility stylesheet (CommonStyle).

  @return {Object|null} - the styles, or null when outside a provider
  *********************************************************************/
  useStyles: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    // Return the utility stylesheet or null when outside a provider
    return ctx ? ctx.CommonStyle : null;
  },


  /********************************************************************
  Hook: the themed component library (atoms / molecules / variants).

  @return {Object|null} - the Component registry, or null when outside a provider
  *********************************************************************/
  useComponents: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    // Return the themed component registry or null when outside a provider
    return ctx ? ctx.Component : null;
  }


};/////////////////////////// Public Functions END //////////////////////////////
