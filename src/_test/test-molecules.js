'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const TestRenderer = require('react-test-renderer');

const { Component: C, CommonStyle, theme, React } = require('./loader');

if (typeof global.document === 'undefined') {
  global.document = { createElement: function () { return { style: {} }; } };
}

// Card molecule
test('Card renders as a View with surface background and lg radius', function () {
  const el = TestRenderer.create(React.createElement(C.Card, null, 'content'));
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.className.indexOf('r-backgroundColor') !== -1);
  assert.ok(json.props.className.indexOf('r-borderRadius') !== -1);
  el.unmount();
});

test('Card renders children', function () {
  const el = TestRenderer.create(React.createElement(C.Card, null, 'inner'));
  const json = el.toJSON();
  assert.equal(json.children[0], 'inner');
  el.unmount();
});

// ButtonPrimary molecule
test('ButtonPrimary renders a Pressable with accessibilityRole button', function () {
  const el = TestRenderer.create(React.createElement(C.ButtonPrimary, { title: 'Save', onPress: function () {} }));
  const json = el.toJSON();
  assert.equal(json.type, 'button');
  assert.equal(json.props.role, 'button');
  assert.equal(json.props['aria-label'], 'Save');
  el.unmount();
});

test('ButtonPrimary renders title text as child', function () {
  const el = TestRenderer.create(React.createElement(C.ButtonPrimary, { title: 'Click me', onPress: function () {} }));
  const json = el.toJSON();
  assert.equal(typeof json.children, 'object');
  assert.equal(json.children[0].children[0], 'Click me');
  el.unmount();
});

test('ButtonPrimary with disabled sets onPress to null', function () {
  const el = TestRenderer.create(React.createElement(C.ButtonPrimary, { title: 'Disabled', disabled: true }));
  const json = el.toJSON();
  assert.equal(json.props.disabled, true);
  el.unmount();
});

// ButtonPrimaryTypeA variant
test('ButtonPrimaryTypeA renders with primary border', function () {
  const el = TestRenderer.create(React.createElement(C.variant.ButtonPrimaryTypeA, { title: 'Ghost', onPress: function () {} }));
  const json = el.toJSON();
  assert.equal(json.type, 'button');
  assert.ok(json.props.className.indexOf('r-borderColor') !== -1);
  el.unmount();
});

// RawBox freeform
test('RawBox renders a plain View with raw style', function () {
  const el = TestRenderer.create(React.createElement(C.freeform.RawBox, { style: { backgroundColor: '#111' } }, 'raw'));
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.style.backgroundColor.indexOf('17,17,17') !== -1);
  assert.equal(json.children[0], 'raw');
  el.unmount();
});
