// Info: Web adapter for the Icons slot.
// Provides a minimal glyph component that renders text placeholders.
// The harness proves portability, not icon fidelity.
'use strict';

const React = require('react');

function TextIcon (props) {
  const { name, size, color, style, ...rest } = props;
  return React.createElement('span', {
    style: { fontSize: size || 24, color: color || '#000', display: 'inline-block', ...style },
    ...rest
  }, '[' + (name || 'icon') + ']');
}


module.exports = function (Lib, config) {

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: TextIcon
  };

};
