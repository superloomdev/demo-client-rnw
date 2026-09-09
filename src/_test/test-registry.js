// Info: L1 - Registry smoke tests. Iterates every component in the built
// standard registry, renders each with smoke-props (where available) or
// empty props, and asserts no crash. This catches the entire class of
// undefined-component bugs without manual render testing.
//
// The test tier is a host: it builds the registry through the real loader,
// then exercises every registered component in isolation. Smoke-props are
// owned locally (src/_test/smoke-props.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import loader from './loader.js';
import SMOKE_PROPS from './smoke-props.js';

const { Component, React, TestRenderer, act } = loader();


// Stub document for react-native-web TextInput and Overlay
if (typeof global.document === 'undefined') {
  global.document = {
    createElement: function () {
      return { style: {} };
    },
    addEventListener: function () {},
    removeEventListener: function () {}
  };
}


// Sub-registries (objects containing multiple components, not components themselves)
const SUB_REGISTRIES = ['variant', 'freeform', 'provider'];

// Overlay/portal components that render null without an open/visible prop or
// require a React element as children. These are tested with children.
const OVERLAY_COMPONENTS = [
  'Modal', 'ComposedModal', 'Popover', 'Tooltip', 'Toggletip',
  'Menu', 'SidePanel', 'OverflowMenu'
];


// ─── Flat Components ───────────────────────────────────────────────────────

const names = Object.keys(Component).filter(function (name) {
  return SUB_REGISTRIES.indexOf(name) === -1;
});

for (let i = 0; i < names.length; i++) {
  const name = names[i];
  const Comp = Component[name];

  if (OVERLAY_COMPONENTS.indexOf(name) !== -1) {
    // Overlay components: render with children, accept null tree (closed state)
    test('registry: ' + name + ' renders without crash', function () {
      const props = SMOKE_PROPS[name] || {};
      const child = React.createElement('span', null, 'test');
      const merged = Object.assign({}, props, { children: child });
      let el; act(() => {
        el = TestRenderer.create(React.createElement(Comp, merged));
      });
      // Overlays may return null when closed - that is valid, not a crash
      el.unmount();
    });
  } else {
    // Standard components: render with smoke-props, assert non-null tree
    test('registry: ' + name + ' renders without crash', function () {
      const props = SMOKE_PROPS[name] || {};
      let el; act(() => {
        el = TestRenderer.create(React.createElement(Comp, props));
      });
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Variant Sub-Registry ──────────────────────────────────────────────────

if (Component.variant) {
  const variantNames = Object.keys(Component.variant);
  for (let i = 0; i < variantNames.length; i++) {
    const name = variantNames[i];
    const Comp = Component.variant[name];

    test('registry variant: ' + name + ' renders without crash', function () {
      const props = SMOKE_PROPS[name] || {};
      let el; act(() => {
        el = TestRenderer.create(React.createElement(Comp, props));
      });
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'variant.' + name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Freeform Sub-Registry ─────────────────────────────────────────────────

if (Component.freeform) {
  const freeformNames = Object.keys(Component.freeform);
  for (let i = 0; i < freeformNames.length; i++) {
    const name = freeformNames[i];
    const Comp = Component.freeform[name];

    test('registry freeform: ' + name + ' renders without crash', function () {
      const props = SMOKE_PROPS[name] || {};
      let el; act(() => {
        el = TestRenderer.create(React.createElement(Comp, props));
      });
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'freeform.' + name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Provider Sub-Registry ─────────────────────────────────────────────────

if (Component.provider) {
  const providerNames = Object.keys(Component.provider);
  for (let i = 0; i < providerNames.length; i++) {
    const name = providerNames[i];
    const Comp = Component.provider[name];

    test('registry provider: ' + name + ' renders children', function () {
      const child = React.createElement('span', null, 'child');
      let el; act(() => {
        el = TestRenderer.create(React.createElement(Comp, { children: child }));
      });
      // Providers render their children - tree should not be null
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'provider.' + name + ' produced null tree');
      el.unmount();
    });
  }
}
