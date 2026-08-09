'use strict';

const React = require('react');

function makeComponent (name) {
  return function (props) {
    return React.createElement(name, props, props && props.children);
  };
}

module.exports = {
  Link: makeComponent('Link'),
  Redirect: makeComponent('Redirect')
};
