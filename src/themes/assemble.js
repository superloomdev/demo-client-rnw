// Info: Theme assembly logic extracted from theme-context.js. Bridges themer
// tokens to the app's { Color, Dimension, Font } shape, validates font
// families against the font core registry, and builds the themed component
// library. Also derives the themer platform string from the client
// environment so the theme-context never hardcodes a platform.
import themerBridge from './themer-bridge.js';
import combineComponent from '../components/index.js';


// Families whose async load has already been attempted this session. A family
// that cannot register, because the host manifest does not carry it, must not
// re-trigger a re-derive on every assemble, which would spin the theme forever.
const ATTEMPTED = new Set();


/////////////////////////// Public Functions START /////////////////////////////


/********************************************************************
Derive the themer platform string for the component library.

The component library is React Native Web. RNW is itself the web projection:
it consumes unit-free numbers and emits CSS. Requesting the themer's 'web'
projection here would apply two projections and produce rem strings that
React Native cannot consume on iOS or Android. See theming.md, Resolve
Then Emit.

@return {string} - 'native'
*********************************************************************/
function platform () {

  // Return the native projection so the component library emits unit-free numbers
  return 'native';

}


/********************************************************************
Assemble the theme from built themer tokens. Bridges the flat token map
to { Color, Dimension, Font }, validates font families against the font
core registry (falling back to System and triggering async loading for
unregistered families), and builds the themed component library.

@param {Object} Lib              - the dependency container
@param {Object} built            - the themer's buildTheme result
@param {Object} built.tokens     - the flat token map
@param {Array}  currentLayers    - the current layer array (for re-derive)
@param {Object} updateLayersRef  - React ref to the extension's update_layers

@return {Object} - { theme, Component, CommonStyle }
*********************************************************************/
function assemble (Lib, built, currentLayers, updateLayersRef) {

  // Strict mode: refuse a theme the contrast pass could not satisfy, and refuse
  // one it had to rewrite. Off by default so a server-driven theme degrades
  // rather than crashing; the test tier and CI turn it on.
  if (Lib.CONFIG && Lib.CONFIG.STRICT_THEME) {

    // An unsatisfiable pairing is an authoring error, so name every one
    if (built.violations && !Lib.Utils.isEmptyArray(built.violations)) {
      throw new TypeError('theme: contrast violations: ' + JSON.stringify(built.violations));
    }

    // A correction means the authored value was wrong, not that the theme is fine
    if (built.corrections && !Lib.Utils.isEmptyArray(built.corrections)) {
      throw new TypeError('theme: tokens were auto-corrected: ' + JSON.stringify(built.corrections));
    }

  } else if (Lib.Debug) {

    // In lenient mode, log the counts so a correction is visible rather than
    // silently discarded. A correction nobody sees is how a theme drifts.
    if (built.violations && !Lib.Utils.isEmptyArray(built.violations)) {
      Lib.Debug.warn('theme: ' + built.violations.length + ' contrast violation(s)');
    }

    if (built.corrections && !Lib.Utils.isEmptyArray(built.corrections)) {
      Lib.Debug.warn('theme: ' + built.corrections.length + ' token correction(s)');
    }

  }

  // Bridge the themer's flat token map to { Color, Dimension, Font }
  const theme = themerBridge.bridgeTheme(built.tokens);

  // Validate font families against the font core registry.
  // Unregistered families fall back to System and trigger async loading.
  if (theme.Font && theme.Font.family) {
    const familyRoles = Object.keys(theme.Font.family);
    for (let i = 0; i < familyRoles.length; i++) {
      const role = familyRoles[i];
      const familyName = theme.Font.family[role];

      // Check if the family is registered in the font core
      if (Lib.Font && Lib.Font.isRegistered) {
        if (!Lib.Font.isRegistered(familyName) && familyName !== 'System') {

          // Log warning for the unregistered family
          if (Lib.Debug) {
            Lib.Debug.warn('theme: family "' + familyName + '" not registered, falling back to System');
          }

          // Fall back to System for now
          theme.Font.family[role] = 'System';

          // Trigger async loading of the family, then re-derive. The ledger
          // makes the attempt once per family; the isRegistered check makes
          // the re-derive conditional on the load having really landed.
          if (Lib.Fonts && Lib.Fonts.loadFamily && !ATTEMPTED.has(familyName)) {
            ATTEMPTED.add(familyName);
            Lib.Fonts.loadFamily(familyName).then(function (result) {
              if (result.success && Lib.Font.isRegistered(familyName)) {

                // Re-derive by calling update_layers with a fresh copy
                if (updateLayersRef && updateLayersRef.current) {
                  updateLayersRef.current(currentLayers.slice());
                }

              }
            });
          }

        }
      }
    }
  }

  // Build the themed component library from the app's component source
  const components = combineComponent(Lib, theme);

  // Return the assembled theme, component library, and shared styles
  return {
    theme: theme,
    Component: components.Component,
    CommonStyle: components.CommonStyle
  };

}


export { platform, assemble };/////////////////////////// Public Functions END //////////////////////////////
