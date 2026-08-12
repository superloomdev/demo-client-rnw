// Info: Icon atom. Wraps an injected glyph component (Lib.Icons.Glyph).
//   name  -> glyph name (vendor-specific, set by the host adapter)
//   size  -> dimension token (xs..xxl) OR a raw number
//   color -> color token (e.g. 'TEXT_PRIMARY' / 'text_primary') OR a raw hex
'use strict';

const React = require('react');


module.exports = function (Component, CommonStyle, theme, Lib) {

  return function Icon (props) {

    const { name, size, color, style, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Resolve size: token -> px, number -> px, default md
    let px = theme.Dimension.fontSize.md;
    if (typeof size === 'number') { px = size; }
    else if (size && theme.Dimension.fontSize[size]) { px = theme.Dimension.fontSize[size]; }

    // Resolve color: hex -> as-is, token -> palette, default TEXT_PRIMARY
    let hex = theme.Color.TEXT_PRIMARY;
    if (color && color.charAt(0) === '#') { hex = color; }
    else if (color && theme.Color[color.toUpperCase()]) { hex = theme.Color[color.toUpperCase()]; }

    return React.createElement(
      Lib.Icons.Glyph,
      Object.assign({ name: name, size: px, color: hex, style: style }, rest)
    );

  };

};
