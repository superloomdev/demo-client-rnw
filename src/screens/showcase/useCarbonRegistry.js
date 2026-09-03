// Info: Showcase registry bridge. The published Carbon package exposes one
// entry point, createSystem, which builds the themed infrastructure without
// instantiating any component. This hook builds a system against the LIVE
// theme from ThemeContext and registers the whole roster from the package's
// registration barrel, so the showcase galleries always iterate the package's
// actual roster instead of a hardcoded list.
//
// The showcase renders every component, so it registers everything. A screen
// that uses a bounded set imports those components by name instead and ships
// only those factories.
//
// The Carbon build requires a theme contract with a Breakpoint group (which the
// demo's assembled theme does not carry) and a Device adapter (which the demo
// does not inject). Both are supplied here: a static Breakpoint map and a
// minimal Device adapter backed by react-native's Platform + Dimensions.
import { useMemo } from 'react';
import { Platform, Dimensions } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';


// Static Carbon breakpoint map. The demo theme engine does not emit Breakpoint,
// so we layer the canonical Carbon scale onto the assembled theme before build.
const BREAKPOINTS = Object.freeze({
  base: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280
});


// Minimal Device adapter matching the js-rnw-helper-device contract the Carbon
// library expects: getPlatform, getViewport, onViewportChange. Backed by the
// react-native Platform + Dimensions modules so it works on web, iOS, and
// Android without an extra dependency.
function createDeviceAdapter (Lib) {

  // Track active viewport listeners so they can be cleaned up on unsubscribe
  const listeners = [];

  // Return the Device adapter object matching the js-rnw-helper-device contract
  return {

    getPlatform: function () {
      // Return the current platform identifier in the Device adapter contract shape
      return { success: true, platform: Platform.OS, error: null };
    },

    getViewport: function () {
      // Query the current window dimensions from the native platform
      const win = Dimensions.get('window');
      // Return the viewport payload in the Device adapter contract shape
      return { success: true, width: win.width, height: win.height, error: null };
    },

    onViewportChange: function (callback) {
      // Register the callback so we can remove it later on unsubscribe
      listeners.push(callback);

      // Subscribe to native dimension changes and forward them to the callback
      const sub = Dimensions.addEventListener('change', function (dims) {
        // Extract the window dimensions from the change event payload
        const win = dims.window || dims;
        callback({ width: win.width, height: win.height });
      });

      // Return an unsubscribe handle so callers can release the listener
      return {
        success: true,
        unsubscribe: function () {
          // Remove the callback from the tracked listener list if still present
          const idx = listeners.indexOf(callback);
          if (idx !== -1) {
            listeners.splice(idx, 1);
          }
          if (sub && Lib.Utils.isFunction(sub.remove)) {
            sub.remove();
          }
        },
        error: null
      };
    }

  };

}



// Hook: build (and memoize) the themed Carbon registry from the live theme.
// Returns { Component, Style } or null while the theme is unavailable.
export default function useCarbonRegistry () {

  // Obtain the shared Lib bundle and the live theme from the theme context
  const Lib = useLib();
  const { useTheme } = Lib.ThemeContext;
  const theme = useTheme();

  // Return the memoized Carbon registry so it rebuilds only when inputs change
  return useMemo(function () {

    // Theme is null outside a provider - nothing to build yet
    if (!theme) {
      // Return null so callers know the registry is not ready
      return null;
    }

    // The demo's theme from useTheme() is bridged into
    // { Color, Dimension: { fontSize, space, radius }, Font: { family, weight } }
    // by themer-bridge.js. The Carbon package expects the same structure plus
    // a Breakpoint group. Layer it on.
    const contract = Object.assign({}, theme, { Breakpoint: BREAKPOINTS });

    // Build the Carbon system with the shared Lib injections + a Device adapter
    const system = Lib.CarbonComponents.createSystem({
      Utils: Lib.Utils,
      Debug: Lib.Debug,
      React: Lib.React,
      Device: createDeviceAdapter(Lib),
      Icons: Lib.Icons,
      Font: Lib.Font
    }, {}, contract, 'base');

    // Register the whole roster; the showcase iterates every namespace
    const roster = Lib.CarbonComponents.roster;

    system.addComponents(roster.COMPONENTS);
    system.addVariants(roster.VARIANTS);
    system.addFreeforms(roster.FREEFORMS);
    system.addProviders(roster.PROVIDERS);

    // A missing sibling would surface as a render-time mystery, so fail here
    const check = system.checkRegistry();

    if (!check.complete) {
      throw new Error('Incomplete Carbon registry: ' + JSON.stringify(check.missing));
    }

    // Expose the build count so an E2E test can lock the re-derive count. A
    // runaway count is invisible to a functional assertion but is the loudest
    // possible signal that the theme is spinning.
    if (typeof globalThis !== 'undefined') {
      globalThis.__carbonSystemBuilds = (globalThis.__carbonSystemBuilds || 0) + 1;
    }

    // Return the built Carbon component registry for the showcase galleries
    return { Component: system.Component, Style: system.Style };

  }, [Lib, theme]);

}
