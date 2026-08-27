// Info: L0 - Environment smoke tests. Verifies the test-tier module aliases
// resolve correctly: react-native maps to react-native-web, expo is absent.
// These must pass before any component tests are meaningful.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as reactNative from 'react-native';
import { createRequire as createCjsRequire } from 'node:module';

const cjs = createCjsRequire(import.meta.url);

// 1. react-native yields an object whose StyleSheet.create is a function
test('react-native is react-native-web with StyleSheet.create', function () {
  assert.equal(typeof reactNative.StyleSheet.create, 'function');
});

// 2. cjs.resolve('react-native') resolves to a package whose name is react-native-web
test('react-native resolves to react-native-web', function () {
  const resolved = cjs.resolve('react-native');
  const pkg = cjs(resolved.replace(/\/dist\/cjs\/index\.js$/, '/package.json'));
  assert.equal(pkg.name, 'react-native-web');
});

// 3. cjs('expo') throws with code exactly MODULE_NOT_FOUND
test('expo is absent (MODULE_NOT_FOUND)', function () {
  assert.throws(function () {
    cjs('expo');
  }, function (err) {
    return err.code === 'MODULE_NOT_FOUND';
  });
});
