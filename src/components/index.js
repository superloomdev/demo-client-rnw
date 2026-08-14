// Info: Component library entry — the equivalent of the reference's
// combineComponent() + updateComponentTheme(). Given the loader (Lib) and an
// assembled theme, it:
//   1. generates the atomic CommonStyle from the theme tokens
//   2. wraps every atom/molecule/variant through the one HOC
//   3. returns { Component, CommonStyle }
// Calling this again with a NEW theme IS "updateComponentTheme" — the runtime
// retheming seam (the ThemeProvider does exactly that on a theme switch).
'use strict';


/********************************************************************
Build the themed component library.

@param {Object} Lib   - The shared Lib container
@param {Object} theme - Assembled theme { Color, Dimension, Font }

@return {Object} - { Component, CommonStyle }
*********************************************************************/
module.exports = function combineComponent (Lib, theme) {

  // Generate the atomic utility stylesheet from the theme
  const CommonStyle = require('./commonStyles')(theme);

  // Build the RTL-injecting HOC once
  const hoc = require('./componentHoc')(Lib);

  // The shared component registry (molecules close over this object)
  const Component = {};

  // Helper: instantiate a factory and wrap it with the HOC
  const make = function (factory) {
    return hoc(factory(Component, CommonStyle, theme, Lib));
  };

  // ~~~~~~~~~~ Atoms ~~~~~~~~~~
  Component.View = make(require('./atom/view'));
  Component.Text = make(require('./atom/text'));
  Component.Icon = make(require('./atom/icon'));
  Component.TextInput = make(require('./atom/textInput'));

  // ~~~~~~~~~~ Molecules (canonical) ~~~~~~~~~~
  Component.Card = make(require('./molecule/card'));
  Component.ButtonPrimary = make(require('./molecule/buttonPrimary'));

  // ~~~~~~~~~~ Structured exceptions (variant registry) ~~~~~~~~~~
  Component.variant = {
    ButtonPrimaryTypeA: make(require('./variant/buttonPrimaryTypeA'))
  };

  // ~~~~~~~~~~ Unstructured exceptions (freeform; NO tokens) ~~~~~~~~~~
  Component.freeform = {
    RawBox: require('./freeform/rawBox')()
  };

  // Return the themed library + its generated styles
  return { Component: Component, CommonStyle: CommonStyle };

};
