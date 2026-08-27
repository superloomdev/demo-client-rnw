// Info: Component library entry - the equivalent of the reference's
// combineComponent() + updateComponentTheme(). Given the loader (Lib) and an
// assembled theme, it:
//   1. generates the atomic CommonStyle from the theme tokens
//   2. wraps every atom/molecule/variant through the one HOC
//   3. returns { Component, CommonStyle }
// Calling this again with a NEW theme IS "updateComponentTheme" - the runtime
// retheming seam (the ThemeProvider does exactly that on a theme switch).
import commonStyles from './commonStyles.js';
import componentHoc from './componentHoc.js';
import atomView from './atom/view.js';
import atomText from './atom/text.js';
import atomIcon from './atom/icon.js';
import atomTextInput from './atom/textInput.js';
import moleculeCard from './molecule/card.js';
import moleculeButtonPrimary from './molecule/buttonPrimary.js';
import variantButtonPrimaryTypeA from './variant/buttonPrimaryTypeA.js';
import freeformRawBox from './freeform/rawBox.js';


/********************************************************************
Build the themed component library.

@param {Object} Lib   - The shared Lib container
@param {Object} theme - Assembled theme { Color, Dimension, Font }

@return {Object} - { Component, CommonStyle }
*********************************************************************/
export default function combineComponent (Lib, theme) {

  // Generate the atomic utility stylesheet from the theme
  const CommonStyle = commonStyles(theme);

  // Build the RTL-injecting HOC once
  const hoc = componentHoc(Lib);

  // The shared component registry (molecules close over this object)
  const Component = {};

  // Helper: instantiate a factory and wrap it with the HOC
  const make = function (factory) {
    // Wrap the instantiated component with the RTL-injecting HOC
    return hoc(factory(Component, CommonStyle, theme, Lib));
  };

  // ~~~~~~~~~~ Atoms ~~~~~~~~~~
  Component.View = make(atomView);
  Component.Text = make(atomText);
  Component.Icon = make(atomIcon);
  Component.TextInput = make(atomTextInput);

  // ~~~~~~~~~~ Molecules (canonical) ~~~~~~~~~~
  Component.Card = make(moleculeCard);
  Component.ButtonPrimary = make(moleculeButtonPrimary);

  // ~~~~~~~~~~ Structured exceptions (variant registry) ~~~~~~~~~~
  Component.variant = {
    ButtonPrimaryTypeA: make(variantButtonPrimaryTypeA)
  };

  // ~~~~~~~~~~ Unstructured exceptions (freeform; NO tokens) ~~~~~~~~~~
  Component.freeform = {
    RawBox: freeformRawBox()
  };

  // Return the themed library + its generated styles
  return { Component: Component, CommonStyle: CommonStyle };

}
