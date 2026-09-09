// Info: L1 - Atom component render tests. Verifies each atom in the standard
// component registry renders correctly with Carbon v11 token props
// (background, radius, typeSet, color, weight) and produces the expected
// DOM structure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import TestRenderer, { act } from 'react-test-renderer';
import loader from './loader.js';

const { Component: C, React } = loader();

// react-native-web TextInput references document in a useEffect; stub it for Node
if (typeof global.document === 'undefined') {
  global.document = { createElement: function () {
    return { style: {} };
  } };
}


// View atom
test('View renders with background token', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.View, { background: 'background' }, 'hello'));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.className.indexOf('r-backgroundColor') !== -1);
  el.unmount();
});

test('View renders with radius token', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.View, { radius: 'radius_04' }, 'x'));
  });
  const json = el.toJSON();
  assert.ok(json.props.className.indexOf('r-borderRadius') !== -1);
  el.unmount();
});

test('View renders with border token', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.View, { border: true }, 'x'));
  });
  const json = el.toJSON();
  assert.ok(json.props.className.indexOf('r-borderWidth') !== -1);
  el.unmount();
});

// Text atom
test('Text renders with default typeSet body01', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Text, null, 'hello'));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'div');
  assert.ok(json.props.className.indexOf('r-fontSize') !== -1);
  el.unmount();
});

test('Text renders with typeSet heading04', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Text, { typeSet: 'heading04' }, 'big'));
  });
  const json = el.toJSON();
  assert.ok(json.props.className.indexOf('r-fontSize') !== -1);
  el.unmount();
});

test('Text renders with color token text_secondary', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Text, { color: 'text_secondary' }, 'muted'));
  });
  const json = el.toJSON();
  assert.ok(json.props.className.indexOf('r-color') !== -1);
  el.unmount();
});

test('Text renders with weight bold', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Text, { weight: 'bold' }, 'bold'));
  });
  const json = el.toJSON();
  assert.ok(json.props.className.indexOf('r-fontWeight') !== -1);
  el.unmount();
});

// TextInput atom
test('TextInput renders with themed border and surface background', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.TextInput, { placeholder: 'test' }));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'input');
  assert.ok(json.props.className.indexOf('r-backgroundColor') !== -1);
  el.unmount();
});

// Icon atom
test('Icon renders using injected Lib.Icons.Glyph', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Icon, { name: 'add', size: 'lg', color: 'interactive' }));
  });
  const json = el.toJSON();
  assert.equal(json.type, 'span');
  assert.equal(json.children[0], '[add]');
  el.unmount();
});

test('Icon resolves numeric size to exact px', function () {
  let el; act(() => {
    el = TestRenderer.create(React.createElement(C.Icon, { name: 'check', size: 32 }));
  });
  const json = el.toJSON();
  assert.equal(json.props.style.fontSize, 32);
  el.unmount();
});
