// Info: Showcase registry bridge. The published Carbon package is a factory
// (require('@superloomdev/rnw-components-carbon')(shared_libs, config) -> { build,
// rebuild, themeContract, useBreakpoint }). This hook builds the themed
// Component registry from that factory against the LIVE theme from
// ThemeContext, so the showcase galleries always iterate the package's actual
// roster instead of a hardcoded list.
//
// The Carbon build requires a theme contract with a Breakpoint group (which the
// demo's assembled theme does not carry) and a Device adapter (which the demo
// does not inject). Both are supplied here: a static Breakpoint map and a
// minimal Device adapter backed by react-native's Platform + Dimensions.
import { useMemo } from 'react';
import { Platform, Dimensions } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');


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
function createDeviceAdapter () {

  const listeners = [];

  return {

    getPlatform: function () {
      return { success: true, platform: Platform.OS, error: null };
    },

    getViewport: function () {
      const win = Dimensions.get('window');
      return { success: true, width: win.width, height: win.height, error: null };
    },

    onViewportChange: function (callback) {
      listeners.push(callback);

      const sub = Dimensions.addEventListener('change', function (dims) {
        const win = dims.window || dims;
        callback({ width: win.width, height: win.height });
      });

      return {
        success: true,
        unsubscribe: function () {
          const idx = listeners.indexOf(callback);
          if (idx !== -1) {
            listeners.splice(idx, 1);
          }
          if (sub && typeof sub.remove === 'function') {
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

  const Lib = useLib();
  const { useTheme } = Lib.ThemeContext;
  const theme = useTheme();

  return useMemo(function () {

    // Theme is null outside a provider - nothing to build yet
    if (!theme) {
      return null;
    }

    // The demo's theme from useTheme() is bridged into
    // { Color, Dimension: { fontSize, space, radius }, Font: { family, weight } }
    // by themer-bridge.js. The Carbon package expects the same structure plus
    // a Breakpoint group. Layer it on.
    const contract = Object.assign({}, theme, { Breakpoint: BREAKPOINTS });

    // Build the Carbon factory with the shared Lib injections + a Device adapter
    const Components = Lib.CarbonComponents({
      Utils: Lib.Utils,
      Debug: Lib.Debug,
      React: Lib.React,
      Device: createDeviceAdapter(),
      Icons: Lib.Icons,
      Font: Lib.Font
    }, {});

    return Components.build(contract, 'base');

  }, [Lib, theme]);

}
