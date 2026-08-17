// Info: L1 - Carbon Registry smoke tests. Iterates every component in the
// built Carbon registry, renders each with hint-props (where available) or
// empty props, and asserts no crash. This catches the entire class of
// undefined-component bugs without manual render testing.
//
// The test tier is a host: it builds the registry through the real loader,
// then exercises every registered component in isolation.
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const loader = require('./loader');
const { CarbonComponent, React, TestRenderer } = loader();
const HINT_PROPS = require('@superloomdev/rnw-components-carbon/data/hint-props');


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

const names = Object.keys(CarbonComponent).filter(function (name) {
  return SUB_REGISTRIES.indexOf(name) === -1;
});

for (let i = 0; i < names.length; i++) {
  const name = names[i];
  const Comp = CarbonComponent[name];

  if (OVERLAY_COMPONENTS.indexOf(name) !== -1) {
    // Overlay components: render with children, accept null tree (closed state)
    test('Carbon: ' + name + ' renders without crash', function () {
      const props = HINT_PROPS[name] || {};
      const child = React.createElement('span', null, 'test');
      const merged = Object.assign({}, props, { children: child });
      const el = TestRenderer.create(React.createElement(Comp, merged));
      // Overlays may return null when closed — that is valid, not a crash
      el.unmount();
    });
  } else {
    // Standard components: render with hint-props, assert non-null tree
    test('Carbon: ' + name + ' renders without crash', function () {
      const props = HINT_PROPS[name] || {};
      const el = TestRenderer.create(React.createElement(Comp, props));
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Variant Sub-Registry ──────────────────────────────────────────────────

if (CarbonComponent.variant) {
  const variantNames = Object.keys(CarbonComponent.variant);
  for (let i = 0; i < variantNames.length; i++) {
    const name = variantNames[i];
    const Comp = CarbonComponent.variant[name];

    test('Carbon variant: ' + name + ' renders without crash', function () {
      const props = HINT_PROPS[name] || {};
      const el = TestRenderer.create(React.createElement(Comp, props));
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'variant.' + name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Freeform Sub-Registry ─────────────────────────────────────────────────

if (CarbonComponent.freeform) {
  const freeformNames = Object.keys(CarbonComponent.freeform);
  for (let i = 0; i < freeformNames.length; i++) {
    const name = freeformNames[i];
    const Comp = CarbonComponent.freeform[name];

    test('Carbon freeform: ' + name + ' renders without crash', function () {
      const props = HINT_PROPS[name] || {};
      const el = TestRenderer.create(React.createElement(Comp, props));
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'freeform.' + name + ' produced null/undefined tree');
      el.unmount();
    });
  }
}


// ─── Provider Sub-Registry ─────────────────────────────────────────────────

if (CarbonComponent.provider) {
  const providerNames = Object.keys(CarbonComponent.provider);
  for (let i = 0; i < providerNames.length; i++) {
    const name = providerNames[i];
    const Comp = CarbonComponent.provider[name];

    test('Carbon provider: ' + name + ' renders children', function () {
      const child = React.createElement('span', null, 'child');
      const el = TestRenderer.create(React.createElement(Comp, { children: child }));
      // Providers render their children — tree should not be null
      const json = el.toJSON();
      assert.ok(json !== null && json !== undefined, 'provider.' + name + ' produced null tree');
      el.unmount();
    });
  }
}
