'use strict';

const React = require('react');

function SafeAreaView (props) {
  return React.createElement('SafeAreaView', props, props && props.children);
}

module.exports = {
  SafeAreaView: SafeAreaView,
  SafeAreaProvider: function (props) {
    return React.createElement('SafeAreaProvider', props, props && props.children);
  }
};
