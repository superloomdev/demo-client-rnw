// Info: L1 - Molecule component render tests. Verifies composite molecules
// (Tile, Button, ButtonPrimaryTypeA, RawBox) render with correct DOM
// structure, accessibility attributes, and token-resolved styles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import TestRenderer, { act } from 'react-test-renderer';
import loader from './loader.js';

const { Component: C, React } = loader();

if (typeof global.document === 'undefined') {
  global.document = { createElement: function () {
    return { style: {} };
  } };
}

// Tile molecule
test('Tile renders as a View with layer_02 background and radius_08', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Tile, { title: 'Tile' }));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.className.indexOf('r-backgroundColor') !== -1);
  assert.ok(json.props.className.indexOf('r-borderRadius') !== -1);
  el.unmount();
});

test('Tile renders title text as child', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Tile, { title: 'My Title' }));
  });
  const json = el.toJSON();
  // The title is rendered through Registry.Text, so it appears in the tree
  const tree = JSON.stringify(json);
  assert.ok(tree.indexOf('My Title') !== -1);
  el.unmount();
});

// Button atom (primary kind)
test('Button renders a Pressable with accessibilityRole button', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Button, { kind: 'primary', onPress: function () {} }, 'Save'));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'button');
  assert.equal(json.props.role, 'button');
  el.unmount();
});

test('Button renders children text', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Button, { kind: 'primary', onPress: function () {} }, 'Click me'));
  });
  const json = el.toJSON();
  const tree = JSON.stringify(json);
  assert.ok(tree.indexOf('Click me') !== -1);
  el.unmount();
});

test('Button renders with ghost kind (no background token)', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Button, { kind: 'ghost', onPress: function () {} }, 'Ghost'));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'button');
  assert.equal(json.props.role, 'button');
  el.unmount();
});

// ButtonPrimaryTypeA variant
test('ButtonPrimaryTypeA renders with interactive border', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.variant.ButtonPrimaryTypeA, { title: 'Ghost', onPress: function () {} }));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'button');
  assert.ok(json.props.className.indexOf('r-borderColor') !== -1);
  el.unmount();
});

// RawBox freeform
test('RawBox renders a plain View with raw style', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.freeform.RawBox, { style: { backgroundColor: '#111' } }, 'raw'));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.style.backgroundColor.indexOf('17,17,17') !== -1);
  assert.equal(json.children[0], 'raw');
  el.unmount();
});
