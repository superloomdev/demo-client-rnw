// Info: Component tests for demo client screens using react-test-renderer.
// Uses @babel/register to transpile ESM/JSX screen files on the fly.
// RN and expo-router are stubbed via module aliases in the require hook.
'use strict';

// Register Babel to transpile screen source files (import/JSX)
require('@babel/register')({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'classic' }]
  ],
  extensions: ['.js', '.jsx'],
  // Only transpile our screen source files, not node_modules
  ignore: [/node_modules/]
});

// Override module resolution for platform dependencies and ensure
// screen files outside unit/ can resolve react from unit's node_modules.
const Module = require('module');
const path = require('path');
const stubsDir = path.join(__dirname, 'stubs');
const unitNodeModules = path.join(__dirname, 'node_modules');

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native') return path.join(stubsDir, 'react-native.js');
  if (request === 'expo-router') return path.join(stubsDir, 'expo-router.js');
  if (request === 'react-native-safe-area-context') return path.join(stubsDir, 'react-native-safe-area-context.js');
  if (request === '../../../hosts/expo/contexts/lib-context') return path.join(stubsDir, 'lib-context.js');

  // For bare module names (react, react-test-renderer), try unit's node_modules first
  if (!request.startsWith('.') && !request.startsWith('/')) {
    try {
      return originalResolve.call(this, request, { ...parent, paths: [unitNodeModules] }, isMain, options);
    } catch (e) {
      // Fall through to original resolution
    }
  }

  return originalResolve.call(this, request, parent, isMain, options);
};

const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');

const { createLib } = require('./lib-stub');
const { LibCtx } = require('./stubs/lib-context');

// Helper: render a screen component with a test Lib via context
function renderWithLib (component, lib) {
  return ReactTestRenderer.create(
    React.createElement(LibCtx.Provider, { value: lib || createLib() }, component)
  );
}

// Helper: require a screen module and get the default export (handles Babel transpilation)
function requireScreen (relativePath) {
  const mod = require(relativePath);
  return mod.default || mod;
}


// ============================================================================
// 1. LAUNCHER SCREEN
// ============================================================================

test('Launcher renders without crashing in super mode', function () {

  const Launcher = requireScreen('../../main/Launcher');
  const lib = createLib({ mode: 'super' });

  const renderer = renderWithLib(
    React.createElement(Launcher),
    lib
  );

  const tree = renderer.toJSON();
  assert.ok(tree);

  renderer.unmount();

});

test('Launcher renders a Redirect in lean mode', function () {

  const Launcher = requireScreen('../../main/Launcher');
  const lib = createLib({ mode: 'lean' });

  const renderer = renderWithLib(
    React.createElement(Launcher),
    lib
  );

  const tree = renderer.toJSON();

  // The Redirect stub renders as a 'Redirect' element
  assert.ok(tree);
  assert.strictEqual(tree.type, 'Redirect');

  renderer.unmount();

});

test('Launcher renders shape cards for each available shape in super mode', function () {

  const Launcher = requireScreen('../../main/Launcher');
  const shapes = [
    { key: 'tasks', label: 'Tasks', tagline: 'Plan your day', icon: 'checkbox-outline', route: '/tasks' },
    { key: 'notes', label: 'Notes', tagline: 'Capture thoughts', icon: 'document-text-outline', route: '/notes' }
  ];
  const lib = createLib({ mode: 'super', shapes: shapes });

  const renderer = renderWithLib(
    React.createElement(Launcher),
    lib
  );

  const tree = renderer.toJSON();

  // Find Link elements (one per shape)
  function findLinks (node) {
    if (!node) return [];
    if (node.type === 'Link') return [node];
    if (!node.children) return [];
    return node.children.reduce(function (acc, child) {
      return acc.concat(findLinks(child));
    }, []);
  }

  const links = findLinks(tree);
  assert.strictEqual(links.length, 2);

  renderer.unmount();

});


// ============================================================================
// 2. TASKS LIST SCREEN
// ============================================================================

test('TasksList renders without crashing', async function () {

  const TasksList = requireScreen('../../tasks/TasksList');
  const lib = createLib();

  const renderer = renderWithLib(
    React.createElement(TasksList),
    lib
  );

  // Wait for the SDK list() promise to resolve
  await new Promise(function (resolve) { setTimeout(resolve, 10); });

  const tree = renderer.toJSON();
  assert.ok(tree);

  renderer.unmount();

});

test('TasksList shows the seed tasks after loading', async function () {

  const TasksList = requireScreen('../../tasks/TasksList');
  const lib = createLib();

  const renderer = renderWithLib(
    React.createElement(TasksList),
    lib
  );

  // Wait for the SDK list() promise to resolve
  await new Promise(function (resolve) { setTimeout(resolve, 10); });

  const tree = renderer.toJSON();

  // Find Text elements containing task titles
  function findTexts (node) {
    if (!node) return [];
    if (node.type === 'Text') return [node.children];
    if (!node.children) return [];
    return node.children.reduce(function (acc, child) {
      return acc.concat(findTexts(child));
    }, []);
  }

  const texts = findTexts(tree);
  const allText = texts.join(' ');
  assert.ok(allText.indexOf('Welcome to Nimbus') !== -1, 'renders first seed task');

  renderer.unmount();

});


// ============================================================================
// 3. NOTES LIST SCREEN
// ============================================================================

test('NotesList renders without crashing', async function () {

  const NotesList = requireScreen('../../notes/NotesList');
  const lib = createLib();

  const renderer = renderWithLib(
    React.createElement(NotesList),
    lib
  );

  // Wait for the SDK list() promise to resolve
  await new Promise(function (resolve) { setTimeout(resolve, 10); });

  const tree = renderer.toJSON();
  assert.ok(tree);

  renderer.unmount();

});

test('NotesList shows the seed note after loading', async function () {

  const NotesList = requireScreen('../../notes/NotesList');
  const lib = createLib();

  const renderer = renderWithLib(
    React.createElement(NotesList),
    lib
  );

  // Wait for the SDK list() promise to resolve
  await new Promise(function (resolve) { setTimeout(resolve, 10); });

  const tree = renderer.toJSON();

  function findTexts (node) {
    if (!node) return [];
    if (node.type === 'Text') return [node.children];
    if (!node.children) return [];
    return node.children.reduce(function (acc, child) {
      return acc.concat(findTexts(child));
    }, []);
  }

  const texts = findTexts(tree);
  const allText = texts.join(' ');
  assert.ok(allText.indexOf('First note') !== -1, 'renders seed note title');

  renderer.unmount();

});


// ============================================================================
// 4. SCREEN EXPORTS
// ============================================================================

test('screens package exports Launcher, TasksList, and NotesList', function () {

  const screens = require('../../index');

  assert.ok(screens.main, 'main namespace exists');
  assert.ok(screens.tasks, 'tasks namespace exists');
  assert.ok(screens.notes, 'notes namespace exists');

  // Babel transpiles `export default` to `.default` on the module object
  const Launcher = screens.main.Launcher.default || screens.main.Launcher;
  const TasksList = screens.tasks.TasksList.default || screens.tasks.TasksList;
  const NotesList = screens.notes.NotesList.default || screens.notes.NotesList;

  assert.strictEqual(typeof Launcher, 'function');
  assert.strictEqual(typeof TasksList, 'function');
  assert.strictEqual(typeof NotesList, 'function');

});
