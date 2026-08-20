// Info: Theme assembly logic extracted from theme-context.js. Bridges themer
// tokens to the app's { Color, Dimension, Font } shape, validates font
// families against the font core registry, and builds the themed component
// library. Also derives the themer platform string from the client
// environment so the theme-context never hardcodes a platform.
'use strict';


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

  // Bridge the themer's flat token map to { Color, Dimension, Font }
  const themerBridge = require('./themer-bridge');
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

          // Trigger async loading of the family, then re-derive
          if (Lib.Fonts && Lib.Fonts.loadFamily) {
            Lib.Fonts.loadFamily(familyName).then(function (result) {
              if (result.success) {

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
  const combineComponent = require('../components');
  const components = combineComponent(Lib, theme);

  // Return the assembled theme, component library, and shared styles
  return {
    theme: theme,
    Component: components.Component,
    CommonStyle: components.CommonStyle
  };

}


module.exports = {
  platform: platform,
  assemble: assemble
};/////////////////////////// Public Functions END //////////////////////////////
