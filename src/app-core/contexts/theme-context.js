// Info: Theme context - the runtime-theming hub for the host app.
//
// This file wraps the themer-ext-react extension with app-specific logic:
//
//   1. Select a Carbon scheme (white, g10, g90, g100) as the base.
//   2. Optionally overlay a brand layer (tasks, notes) on top.
//   3. Build the standard component system through build-system.js.
//
// The public surface: ThemeProvider, useThemeController, useTheme,
// useStyles, useComponents, ThemeContext.
//
// Loader pattern: SINGLETON. The extension factory is called once in the
// common loader (Lib.ThemerReact). This file wraps the extension's interface
// with app-specific logic and returns the wrapper. Consumers use
// Lib.ThemeContext.* rather than requiring this file.
import { buildSystem, THEME_PLATFORM } from '../../themes/build-system.js';
import { BRAND_LAYERS } from '../../themes/brand-layers.js';
import ButtonPrimaryTypeA from '../../components/variant/buttonPrimaryTypeA.js';
import RawBox from '../../components/freeform/rawBox.js';


// Local variant and freeform components registered on every system build
const LOCAL_VARIANTS = { ButtonPrimaryTypeA: ButtonPrimaryTypeA };
const LOCAL_FREEFORMS = { RawBox: RawBox };


// Injected dependencies + module state, set by the loader (module-scope).
let Lib;              // Lib container (requires React, Themer, ThemerReact, Themes, Fonts)
let React;            // injected React (required)
let Ext;              // themer-ext-react instance (required)
let profile;          // Carbon profile from Lib.Themes.profile
let whiteTokens;      // white scheme tokens (static template)


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects React + Themer extension + Carbon profile via
Lib, exposes the extension's context, and returns the provider/hooks
wrapper.

@param {Object} shared_libs - Lib container; requires React, ThemerReact,
                              Themes, Fonts

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

  // The Carbon profile provides the scheme tokens
  if (!Lib.Themes || !Lib.Themes.profile) {
    throw new TypeError('theme-context: Lib.Themes.profile is required (inject the Carbon profile via the loader).');
  }
  profile = Lib.Themes.profile;
  whiteTokens = profile.schemes.white.tokens;

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
  logic. Selects a Carbon scheme as the base, optionally overlays a brand
  layer, and builds the standard component system through the transform
  seam.

  @param {Object} props          - React props
  @param {string} props.scheme   - scheme name: white, g10, g90, g100
                                   (optional; defaults to white)
  @param {string} props.brand    - brand name: tasks, notes, or none
                                   (optional; defaults to none)
  @param {Node}   props.children - subtree to provide the theme to

  @return {Object} - React element
  *********************************************************************/
  ThemeProvider: function (props) {

    // Ref to capture the extension's update_layers setter from context.
    // The transform function closes over this ref so it can trigger a
    // re-derive when an async font load completes.
    const updateLayersRef = React.useRef(null);

    // Resolve the scheme name (default: white)
    const schemeName = props.scheme || 'white';
    const schemeTokens = profile.schemes[schemeName]
      ? profile.schemes[schemeName].tokens
      : whiteTokens;

    // The template is the white scheme tokens (static). The actual scheme
    // tokens go in the base layer so the template never changes.
    const template = { tokens: whiteTokens };

    // Construct layers: base layer (scheme tokens) + optional brand layer
    const layers = [{ name: 'base', tokens: schemeTokens }];
    const brandName = props.brand;
    if (brandName && BRAND_LAYERS[brandName]) {
      layers.push(BRAND_LAYERS[brandName]);
    }

    // Transform seam: runs inside the extension's useMemo. Delegates to
    // buildSystem so font validation and component building live in one place.
    const transform = React.useCallback(function (built, currentLayers) {
      // Build the standard component system
      const result = buildSystem(
        Lib, built, currentLayers, updateLayersRef,
        LOCAL_VARIANTS, LOCAL_FREEFORMS, 'base'
      );
      // Return the component system and theme for the context.
      // Include the current base layer so updateBrand can preserve the scheme.
      const baseLayer = currentLayers && currentLayers[0];
      return {
        Component: result.system.Component,
        CommonStyle: result.system.Style,
        currentBaseLayer: baseLayer
      };
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
      template: template,
      layers: layers,
      platform: THEME_PLATFORM,
      transform: transform
    }, [
      React.createElement(RefCapture, { key: '__ref_capture' }),
      props.children
    ]);

  },


  // ~~~~~~~~~~ Hooks ~~~~~~~~~~

  /********************************************************************
  Hook: the full controller - { Lib, theme, Component, CommonStyle,
  updateScheme, updateBrand }. Wraps the extension's context with the
  app-shaped API. updateScheme(name) replaces the base scheme;
  updateBrand(layer) replaces only the brand layer.

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
      updateScheme: function (name) {
        // Replace the base scheme. The template stays the same (white tokens);
        // only the layers change. A scheme is a complete token set.
        const schemeTokens = profile.schemes[name]
          ? profile.schemes[name].tokens
          : whiteTokens;
        ctx.update_layers([{ name: 'base', tokens: schemeTokens }]);
      },
      updateBrand: function (layer) {
        // Replace only the brand layer. The current scheme is preserved by
        // reading the current base layer from the transform's context output.
        const currentBase = ctx.currentBaseLayer
          || { name: 'base', tokens: whiteTokens };
        if (layer && BRAND_LAYERS[layer]) {
          ctx.update_layers([currentBase, BRAND_LAYERS[layer]]);
        } else {
          ctx.update_layers([currentBase]);
        }
      }
    };
  },


  /********************************************************************
  Hook: the assembled theme (flat token map).

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

  @return {Object|null} - the Component registry, or null when outside a
                          provider
  *********************************************************************/
  useComponents: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    // Return the themed component registry or null when outside a provider
    return ctx ? ctx.Component : null;
  }


};/////////////////////////// Public Functions END //////////////////////////////
