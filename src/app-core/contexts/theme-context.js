// Info: Theme context - the runtime-theming hub for the host app.
//
// This file wraps the themer-ext-react extension with app-specific logic:
//
//   1. Select a theme profile (base, carbon, material) as the design system.
//   2. Select a scheme within that profile as the base.
//   3. Optionally overlay a brand layer (tasks, notes) on top.
//   4. Build the standard component system through build-system.js.
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
let profiles;        // { base, carbon, material } from Lib.Themes.profiles
let defaultProfileName; // the default profile key


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Injects React + Themer extension + theme profiles via
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

  // The theme profiles provide the scheme tokens for each design system
  if (!Lib.Themes || !Lib.Themes.profiles) {
    throw new TypeError('theme-context: Lib.Themes.profiles is required (inject the theme profiles via the loader).');
  }
  profiles = Lib.Themes.profiles;
  defaultProfileName = Lib.Themes.defaultProfile || 'carbon';

  // Expose the extension's context for advanced consumers
  Extension.ThemeContext = Ext.ThemeContext;

  // Return the public theming interface for consumers
  return Extension;

};/////////////////////////// Module-Loader END ////////////////////////////////


/////////////////////////// Module-Scope Components START ///////////////////////

// The extension is prop-driven: it honors props.layers changes, so the
// wrapper's state is the single source of truth. Font-load re-derives are
// triggered by incrementing a rederive epoch in the wrapper, which produces
// a new layers reference.

/////////////////////////// Module-Scope Components END ///////////////////////



/////////////////////////// Public Functions START /////////////////////////////
const Extension = { // Public theming interface accessible by the host


  // ~~~~~~~~~~ Context ~~~~~~~~~~
  // React context object from the extension (advanced use / custom consumers).
  // Assigned by the loader.

  ThemeContext: null,


  // ~~~~~~~~~~ Provider ~~~~~~~~~~

  /********************************************************************
  ThemeProvider - wraps the extension's ThemeProvider with app-specific
  logic. Selects a theme profile and scheme as the base, optionally
  overlays a brand layer, and builds the standard component system through
  the transform seam.

  The wrapper owns profile, scheme, and brand state. The extension is
  prop-driven: it re-derives when the template or layers reference
  changes. No imperative update_layers calls are needed.
  An async font-load re-derive is triggered by incrementing a rederive
  epoch, which produces a new layers reference.

  @param {Object} props          - React props
  @param {string} props.profile  - profile name: base, carbon, material
                                   (optional; defaults to the default profile)
  @param {string} props.scheme   - scheme name within the profile
                                   (optional; defaults to the profile's first scheme)
  @param {string} props.brand    - brand name: tasks, notes, or none
                                   (optional; defaults to none)
  @param {Node}   props.children - subtree to provide the theme to

  @return {Object} - React element
  *********************************************************************/
  ThemeProvider: function (props) {

    // Hold profile, scheme, and brand in state. The wrapper is the
    // single source of truth for selection; the extension derives from
    // the template and layers props.
    const [profileName, setProfileName] = React.useState(
      props.profile || defaultProfileName
    );
    const [schemeName, setSchemeName] = React.useState(props.scheme || null);
    const [brandName, setBrandName] = React.useState(props.brand || null);

    // Rederive epoch: incremented when an async font load completes.
    // Adding it to the layers useMemo deps produces a new layers
    // reference, which the extension picks up and re-derives.
    const [rederiveEpoch, setRederiveEpoch] = React.useState(0);
    const rederive = React.useCallback(function () {
      setRederiveEpoch(function (n) {
        return n + 1;
      });
    }, []);

    // Resolve the current profile from state
    const currentProfile = profiles[profileName] || profiles[defaultProfileName];
    const schemeKeys = Object.keys(currentProfile.schemes);
    const resolvedScheme = schemeName || schemeKeys[0];

    // The template is the first scheme's full data (tokens, scales, ramp,
    // palette, polarity, meta). The Themer needs ramp and palette to resolve
    // rampStep operations. Profiles that build on top of the base profile
    // (like Material) may omit ramp and palette, so we merge them from the
    // base profile when available. The actual scheme tokens go in the base
    // layer so the template never changes during scheme/brand switches.
    //
    // Memoized on profileName so the template reference is stable across
    // unrelated parent re-renders. The extension's useMemo depends on
    // props.template, so an unstable reference here would cause a full
    // theme re-derive on every render.
    const template = React.useMemo(function () {
      const fs = currentProfile.schemes[schemeKeys[0]];
      const bs = profiles.base.schemes[Object.keys(profiles.base.schemes)[0]];
      return {
        ...fs,
        ...(fs.ramp || bs.ramp ? { ramp: fs.ramp || bs.ramp } : {}),
        ...(fs.palette || bs.palette ? { palette: fs.palette || bs.palette } : {})
      };
    }, [profileName]);

    // Construct layers: base layer (scheme tokens + scales + polarity) + optional brand layer.
    // Memoized on profileName, schemeName, and brandName so the layers reference
    // is stable across unrelated parent re-renders.
    const layers = React.useMemo(function () {
      const cs = currentProfile.schemes[resolvedScheme]
        || currentProfile.schemes[schemeKeys[0]];
      const baseLayer = {
        name: 'base',
        tokens: cs.tokens,
        scales: cs.scales,
        polarity: cs.polarity
      };
      if (brandName && BRAND_LAYERS[brandName]) {
        return [baseLayer, BRAND_LAYERS[brandName]];
      }
      return [baseLayer];
    }, [profileName, schemeName, brandName, rederiveEpoch]);

    // The profile state setters are provided through stable callbacks so
    // the useThemeController hook can call them to switch profiles/schemes/
    // brands. Memoized so the controller functions are referentially stable
    // across unrelated parent re-renders.
    const updateProfile = React.useCallback(function (name) {
      // Switch the entire profile (design system). The wrapper's state
      // is the single source of truth; changing profileName produces a
      // new template and layers reference, which the extension picks up.
      setProfileName(name);
      // Reset scheme and brand so the new profile starts clean
      setSchemeName(null);
      setBrandName(null);
    }, []);

    const updateScheme = React.useCallback(function (name) {
      // Replace the base scheme within the current profile. The
      // template stays the same; only the layers change via state.
      // The brand is cleared so the new scheme is shown without an
      // overlay, matching the selector's visual intent.
      setSchemeName(name);
      setBrandName(null);
    }, []);

    const updateBrand = React.useCallback(function (layer) {
      // Replace only the brand layer. The current scheme is preserved
      // because schemeName state is unchanged.
      setBrandName(layer || null);
    }, []);

    // Transform seam: runs inside the extension's useMemo. Delegates to
    // buildSystem so font validation and component building live in one place.
    // Also passes the profile/scheme/brand state and stable update callbacks
    // through the context so useThemeController can access them without a
    // separate context.
    const transform = React.useCallback(function (built, currentLayers) {
      // Build the standard component system
      const result = buildSystem(
        Lib, built, currentLayers, rederive,
        LOCAL_VARIANTS, LOCAL_FREEFORMS, 'base'
      );
      // Return the component system, theme, and selection state for the context.
      return {
        Component: result.system.Component,
        CommonStyle: result.system.Style,
        profileName: profileName,
        schemeName: schemeName,
        brandName: brandName,
        updateProfile: updateProfile,
        updateScheme: updateScheme,
        updateBrand: updateBrand
      };
    }, [rederive, profileName, schemeName, brandName, updateProfile, updateScheme, updateBrand]);

    // Render the extension's ThemeProvider with the app-specific transform.
    // The wrapper owns profile/scheme/brand state and derives template
    // and layers from it. The extension re-derives when either reference
    // changes. No key prop is needed: the extension is prop-driven and
    // re-derives when template or layers change. No imperative
    // update_layers calls needed.
    return React.createElement(Ext.ThemeProvider, {
      template: template,
      layers: layers,
      platform: THEME_PLATFORM,
      transform: transform
    }, props.children);

  },


  // ~~~~~~~~~~ Hooks ~~~~~~~~~~

  /********************************************************************
  Hook: the full controller - { Lib, theme, Component, CommonStyle,
  updateProfile, updateScheme, updateBrand }. Wraps the extension's
  context with the app-shaped API. updateProfile(name) switches the
  entire design system (remounts with a new template); updateScheme(name)
  replaces the base scheme within the current profile; updateBrand(layer)
  replaces only the brand layer.

  @return {Object|null} - context value, or null when outside a provider
  *********************************************************************/
  useThemeController: function () {
    // Read the extension controller from context
    const ctx = Ext.useThemeController();
    // Read the profile/scheme/brand state from the wrapper's hooks
    // (the wrapper passes these through the extension's context)
    if (!ctx) {
      // Return null when used outside a provider
      return null;
    }

    // Return the app-shaped controller wrapping the extension context.
    // The update functions are stable callbacks defined in the provider.
    return {
      Lib: Lib,
      theme: ctx.theme,
      Component: ctx.Component,
      CommonStyle: ctx.CommonStyle,
      profileName: ctx.profileName || defaultProfileName,
      schemeName: ctx.schemeName || null,
      brandName: ctx.brandName || null,
      updateProfile: ctx.updateProfile || function () {},
      updateScheme: ctx.updateScheme || function () {},
      updateBrand: ctx.updateBrand || function () {}
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
