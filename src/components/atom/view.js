// Info: View atom. The base layout box. Convenience props map to generated utility
// classes (background / radius / border); anything else falls through `style`.
// `isRtlActive` is destructured out so it is never forwarded to the DOM on web.
import React from 'react';
import { View as RNView } from 'react-native';


export default function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  // Return the View component factory
  return function View (props) {

    // Extract layout props and strip RTL flag from the rest
    const { background, radius, border, style, children, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Resolve token props to utility classes
    const cls = [];
    if (background) {
      cls.push(CommonStyle['background_' + background]);
    }
    if (radius) {
      cls.push(CommonStyle['br_' + radius]);
    }
    if (border) {
      cls.push(CommonStyle['border_' + (border === true ? 'default' : border)]);
    }

    // Render the native View with resolved utility classes
    return React.createElement(
      RNView,
      Object.assign({ style: [...cls, style] }, rest),
      children
    );

  };

}
