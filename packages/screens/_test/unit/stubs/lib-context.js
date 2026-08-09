'use strict';

// Stub for hosts/expo/contexts/lib-context.js
// Provides useLib() that returns the test Lib from lib-stub.js

const React = require('react');
const { createLib } = require('../lib-stub');

const LibCtx = React.createContext(null);
const defaultLib = createLib();

module.exports = {
  LibProvider: function (props) {
    return React.createElement(LibCtx.Provider, { value: props.lib || defaultLib }, props && props.children);
  },
  useLib: function () {
    return React.useContext(LibCtx) || defaultLib;
  },
  LibCtx: LibCtx
};
