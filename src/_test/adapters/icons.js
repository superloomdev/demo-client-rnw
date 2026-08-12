// Info: Test-tier stub adapter for the Icons slot.
// Provides a minimal glyph component that renders text placeholders.
'use strict';

const React = require('react');


module.exports = function (Lib, config) {

  return {
    Glyph: function (props) {
      return React.createElement(
        'span',
        { style: { fontSize: props.size || 24, color: props.color || '#000' } },
        '[' + (props.name || 'icon') + ']'
      );
    }
  };

};
