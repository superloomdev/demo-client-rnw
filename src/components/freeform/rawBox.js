// Info: RawBox (UNSTRUCTURED EXCEPTION / escape hatch). This component intentionally
// does NOT receive CommonStyle or the theme and does NOT read any token. It takes a
// raw style and renders it. Use ONLY for surfaces that must abandon the design
// system entirely (chat bubbles, game HUDs, marketing heroes). It lives in the
// fenced `freeform/` namespace so its use is a conscious, reviewable decision and
// so a future lint rule can flag imports from here. It will NOT retheme at runtime.
'use strict';

const React = require('react');
const { View } = require('react-native');


module.exports = function () {

  // Return the RawBox escape-hatch component (no tokens, no theme)
  return function RawBox (props) {
    // Render a raw view with caller-supplied style, bypassing the design system
    return React.createElement(View, { style: props.style }, props.children);
  };

};
