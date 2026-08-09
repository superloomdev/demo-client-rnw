'use strict';

// Minimal react-native stub for Node-based component tests.
// Provides just enough to render screen components with react-test-renderer.

const React = require('react');

function makeComponent (name) {
  return function (props) {
    return React.createElement(name, props, props && props.children);
  };
}

module.exports = {
  ScrollView: makeComponent('ScrollView'),
  Pressable: makeComponent('Pressable'),
  ActivityIndicator: makeComponent('ActivityIndicator'),
  View: makeComponent('View'),
  Text: makeComponent('Text'),
  TextInput: makeComponent('TextInput'),
  StyleSheet: {
    create: function (styles) { return styles; },
    hairlineWidth: 1
  }
};
