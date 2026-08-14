// Info: Test-tier stub adapter for the Navigation slot.
// Provides minimal Link and Redirect functions for component tests.
'use strict';

const React = require('react');


module.exports = function (Lib, config) { // eslint-disable-line no-unused-vars

  return {
    Link: function (props) {
      return React.createElement('a', { href: props.href }, props.children);
    },
    Redirect: function () {
      return null;
    }
  };

};
