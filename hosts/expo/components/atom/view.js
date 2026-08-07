// Info: View atom. The base layout box. Convenience props map to generated utility
// classes (background / radius / border); anything else falls through `style`.
// `isRtlActive` is destructured out so it is never forwarded to the DOM on web.
'use strict';

const React = require('react');
const { View: RNView } = require('react-native');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  return function View (props) {

    const { background, radius, border, style, children, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Resolve token props to utility classes
    const cls = [];
    if (background) { cls.push(CommonStyle['background_' + background]); }
    if (radius) { cls.push(CommonStyle['br_' + radius]); }
    if (border) { cls.push(CommonStyle['border_' + (border === true ? 'default' : border)]); }

    return React.createElement(
      RNView,
      Object.assign({ style: [...cls, style] }, rest),
      children
    );

  };

};
