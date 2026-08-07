// Info: Icon atom. Wraps @expo/vector-icons (Ionicons) which renders on web + native.
//   name  -> Ionicons glyph name
//   size  -> dimension token (xs..xxl) OR a raw number
//   color -> color token (e.g. 'TEXT_PRIMARY' / 'text_primary') OR a raw hex
'use strict';

const React = require('react');
const { Ionicons } = require('@expo/vector-icons');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

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
      Ionicons,
      Object.assign({ name: name, size: px, color: hex, style: style }, rest)
    );

  };

};
