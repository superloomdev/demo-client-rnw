// Info: Icon atom. Wraps an injected glyph component (Lib.Icons.Glyph).
//   name  -> glyph name (vendor-specific, set by the host adapter)
//   size  -> dimension token (xs..xxl) OR a raw number
//   color -> color token (e.g. 'TEXT_PRIMARY' / 'text_primary') OR a raw hex
import React from 'react';


export default function (Component, CommonStyle, theme, Lib) {

  // Return the Icon component factory for the host adapter to mount
  return function Icon (props) {

    // Destructure props to separate glyph styling from pass-through attributes
    const { name, size, color, style, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Resolve size: token -> px, number -> px, default md
    let px = theme.Dimension.fontSize.md;
    if (Lib.Utils.isNumber(size)) {
      px = size;
    } else if (size && theme.Dimension.fontSize[size]) {
      px = theme.Dimension.fontSize[size];
    }

    // Resolve color: hex -> as-is, token -> palette, default TEXT_PRIMARY
    let hex = theme.Color.TEXT_PRIMARY;
    if (color && color.charAt(0) === '#') {
      hex = color;
    } else if (color && theme.Color[color.toUpperCase()]) {
      hex = theme.Color[color.toUpperCase()];
    }

    // Render the glyph through the injected Icons component with resolved props
    return React.createElement(
      Lib.Icons.Glyph,
      Object.assign({ name: name, size: px, color: hex, style: style }, rest)
    );

  };

}
