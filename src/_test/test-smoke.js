// Info: L0 - Environment smoke tests. Verifies the test-tier module aliases
// resolve correctly: react-native maps to react-native-web, expo is absent.
// These must pass before any component tests are meaningful.
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// 1. react-native yields an object whose StyleSheet.create is a function
test('react-native is react-native-web with StyleSheet.create', function () {
  const rn = require('react-native');
  assert.equal(typeof rn.StyleSheet.create, 'function');
});

// 2. require.resolve('react-native') resolves to a package whose name is react-native-web
test('react-native resolves to react-native-web', function () {
  const resolved = require.resolve('react-native');
  const pkg = require(resolved.replace(/\/dist\/cjs\/index\.js$/, '/package.json'));
  assert.equal(pkg.name, 'react-native-web');
});

// 3. require('expo') throws with code exactly MODULE_NOT_FOUND
test('expo is absent (MODULE_NOT_FOUND)', function () {
  assert.throws(function () {
    require('expo');
  }, function (err) {
    return err.code === 'MODULE_NOT_FOUND';
  });
});
