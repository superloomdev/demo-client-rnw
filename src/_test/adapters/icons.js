// Info: Test-tier stub adapter for the Icons slot.
// Provides a minimal Glyph component that renders text placeholders
// (e.g. '[add]') instead of real vector icons. Matches the contract
// the app-core loader expects: { Glyph }.
import React from 'react';


/********************************************************************
Icons adapter factory. Returns an Icons contract with a stub Glyph
component that renders a bracketed name as a span element.

@param {Object} Lib    - Lib container (unused in stub)
@param {Object} config - Config (unused in stub)

@return {Object} - { Glyph }
*********************************************************************/
export default function (Lib, config) { // eslint-disable-line no-unused-vars

  return {
    // Stub Glyph: renders [name] as text for assertions
    Glyph: function (props) {
      return React.createElement(
        'span',
        { style: { fontSize: props.size || 24, color: props.color || '#000' } },
        '[' + (props.name || 'icon') + ']'
      );
    }
  };

};
