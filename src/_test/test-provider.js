// Info: L1 - Theme provider architecture tests. Verifies the one-build
// architecture: exactly one component-system build per effective theme
// action, zero builds for no-op or unrelated actions, stable controller
// references, and correct selection state management.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import TestRenderer, { act } from 'react-test-renderer';
import appLoader from '../app-core/loader.js';
import navigationAdapter from './adapters/navigation.js';
import iconsAdapter from './adapters/icons.js';
import fontsAdapter from './adapters/fonts.js';
import deviceAdapter from './adapters/device.js';
import React from 'react';

// Build Lib through the real app-core loader with stub adapters
const { Lib } = appLoader({
  Navigation: navigationAdapter,
  Icons: iconsAdapter,
  Fonts: fontsAdapter
});
Lib.Device = deviceAdapter(Lib, {});

const ThemeContext = Lib.ThemeContext;

// Helper: create a capture component that exposes the controller via ref
function createCapture () {
  let captured = null;

  function Capture () {
    const controller = ThemeContext.useThemeController();
    captured = controller;
    return null;
  }

  return { Capture, get: function () {
    return captured;
  } };
}

// Helper: reset the build counter
function resetBuilds () {
  if (typeof globalThis !== 'undefined') {
    globalThis.__systemBuilds = 0;
  }
}

// Helper: get the build count
function getBuilds () {
  return (typeof globalThis !== 'undefined' && globalThis.__systemBuilds) || 0;
}


test('provider renders with default profile and produces exactly one build', function () {
  resetBuilds();
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, null,
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  assert.ok(controller, 'controller should be available');
  assert.ok(controller.theme, 'theme should be built');
  assert.ok(controller.Component, 'Component should be available');
  assert.ok(controller.CommonStyle, 'CommonStyle should be available');
  assert.equal(getBuilds(), 1, 'should produce exactly one build on mount');
  root.unmount();
});


test('provider with explicit profile=material produces exactly one build', function () {
  resetBuilds();
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'material' },
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  assert.ok(controller.theme, 'theme should be built with Material profile');
  assert.equal(getBuilds(), 1, 'should produce exactly one build on mount');
  root.unmount();
});


test('unrelated parent rerender produces zero additional builds', function () {
  resetBuilds();
  const cap = createCapture();

  function Parent () {
    const [tick, setTick] = React.useState(0);
    React.useEffect(function () {
      setTick(1);
    }, []);
    return React.createElement(ThemeContext.ThemeProvider, null,
      React.createElement(cap.Capture),
      React.createElement('div', null, String(tick))
    );
  }

  let root;
  act(function () {
    root = TestRenderer.create(React.createElement(Parent));
  });
  const buildsAfterMount = getBuilds();
  assert.equal(buildsAfterMount, 1, 'one build on mount');
  // Force a re-render of the parent
  act(function () {
    root.update(React.createElement(Parent));
  });
  const buildsAfterRerender = getBuilds();
  assert.equal(buildsAfterRerender, 1, 'no additional builds on unrelated rerender');
  root.unmount();
});


test('controller updateProfile resets scheme and brand', function () {
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'carbon', scheme: 'g10', brand: 'tasks' },
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  assert.equal(controller.profileName, 'carbon');
  assert.equal(controller.schemeName, 'g10');
  assert.equal(controller.brandName, 'tasks');

  // Switch to material - should reset scheme and brand
  act(function () {
    controller.updateProfile('material');
  });
  const after = cap.get();
  assert.equal(after.profileName, 'material');
  assert.equal(after.schemeName, null, 'scheme should be reset to null');
  assert.equal(after.brandName, null, 'brand should be reset to null');
  root.unmount();
});


test('controller updateScheme clears brand', function () {
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'carbon', scheme: 'white', brand: 'tasks' },
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  assert.equal(controller.brandName, 'tasks');

  // Switch scheme - should clear brand
  act(function () {
    controller.updateScheme('g10');
  });
  const after = cap.get();
  assert.equal(after.schemeName, 'g10');
  assert.equal(after.brandName, null, 'brand should be cleared on scheme change');
  root.unmount();
});


test('controller updateBrand preserves scheme', function () {
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'carbon', scheme: 'g10' },
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  assert.equal(controller.schemeName, 'g10');
  assert.equal(controller.brandName, null);

  // Set brand
  act(function () {
    controller.updateBrand('tasks');
  });
  const afterSet = cap.get();
  assert.equal(afterSet.brandName, 'tasks');
  assert.equal(afterSet.schemeName, 'g10', 'scheme should be preserved on brand change');

  // Remove brand
  act(function () {
    controller.updateBrand(null);
  });
  const afterRemove = cap.get();
  assert.equal(afterRemove.brandName, null);
  assert.equal(afterRemove.schemeName, 'g10', 'scheme should be preserved on brand removal');
  root.unmount();
});


test('effective selection produces exactly one build; same selection zero', function () {
  resetBuilds();
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'carbon', scheme: 'white' },
        React.createElement(cap.Capture)
      )
    );
  });
  assert.equal(getBuilds(), 1, 'one build on mount');

  // Change scheme - effective action, should produce exactly one build
  resetBuilds();
  const controller = cap.get();
  act(function () {
    controller.updateScheme('g10');
  });
  assert.equal(getBuilds(), 1, 'one build on effective scheme change');

  // Same scheme (no-op) - should produce zero builds
  resetBuilds();
  act(function () {
    controller.updateScheme('g10');
  });
  assert.equal(getBuilds(), 0, 'zero builds on no-op scheme selection');
  root.unmount();
});


test('controller functions are referentially stable across rerenders', function () {
  const cap = createCapture();
  let root;
  act(function () {
    root = TestRenderer.create(
      React.createElement(ThemeContext.ThemeProvider, { profile: 'carbon' },
        React.createElement(cap.Capture)
      )
    );
  });
  const controller = cap.get();
  const updateProfileRef = controller.updateProfile;
  const updateSchemeRef = controller.updateScheme;
  const updateBrandRef = controller.updateBrand;

  // Force a rerender by changing brand
  act(function () {
    controller.updateBrand('tasks');
  });
  const after = cap.get();
  assert.equal(after.updateProfile, updateProfileRef, 'updateProfile should be referentially stable');
  assert.equal(after.updateScheme, updateSchemeRef, 'updateScheme should be referentially stable');
  assert.equal(after.updateBrand, updateBrandRef, 'updateBrand should be referentially stable');
  root.unmount();
});
