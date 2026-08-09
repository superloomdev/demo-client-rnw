// Info: Pure-Node logic tests for the demo client's non-React modules.
// Tests SuperApp shape registry logic and the in-memory SDK stub.
// No Babel, no React, no RN stubs required.
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createSuperApp, createSdk } = require('./lib-stub');


// ============================================================================
// 1. SUPERAPP - determineApp
// ============================================================================

test('SuperApp.determineApp returns super mode when MODE is super', function () {

  const shapes = [
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'notes', label: 'Notes', route: '/notes' }
  ];

  const superApp = createSuperApp('super', shapes);

  const result = superApp.determineApp();

  assert.strictEqual(result.mode, 'super');
  assert.strictEqual(result.shape, undefined);

});

test('SuperApp.determineApp returns lean mode with the first shape when MODE is lean', function () {

  const shapes = [
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'notes', label: 'Notes', route: '/notes' }
  ];

  const superApp = createSuperApp('lean', shapes);

  const result = superApp.determineApp();

  assert.strictEqual(result.mode, 'lean');
  assert.strictEqual(result.shape.key, 'tasks');

});


// ============================================================================
// 2. SUPERAPP - listShapes
// ============================================================================

test('SuperApp.listShapes returns all shapes passed to the constructor', function () {

  const shapes = [
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'notes', label: 'Notes', route: '/notes' }
  ];

  const superApp = createSuperApp('super', shapes);

  const result = superApp.listShapes();

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].key, 'tasks');
  assert.strictEqual(result[1].key, 'notes');

});

test('SuperApp.listShapes returns empty array when no shapes are configured', function () {

  const superApp = createSuperApp('super', []);

  const result = superApp.listShapes();

  assert.strictEqual(result.length, 0);

});


// ============================================================================
// 3. SUPERAPP - getShape
// ============================================================================

test('SuperApp.getShape returns the shape for a valid key', function () {

  const shapes = [
    { key: 'tasks', label: 'Tasks', route: '/tasks' },
    { key: 'notes', label: 'Notes', route: '/notes' }
  ];

  const superApp = createSuperApp('super', shapes);

  const result = superApp.getShape('notes');

  assert.strictEqual(result.key, 'notes');
  assert.strictEqual(result.label, 'Notes');

});

test('SuperApp.getShape returns null for an unknown key', function () {

  const shapes = [
    { key: 'tasks', label: 'Tasks', route: '/tasks' }
  ];

  const superApp = createSuperApp('super', shapes);

  const result = superApp.getShape('nonexistent');

  assert.strictEqual(result, null);

});


// ============================================================================
// 4. SDK - tasks CRUD
// ============================================================================

test('Sdk.tasks.list returns the initial seed tasks', async function () {

  const sdk = createSdk();

  const tasks = await sdk.tasks.list();

  assert.strictEqual(tasks.length, 3);
  assert.strictEqual(tasks[0].title, 'Welcome to Nimbus');
  assert.strictEqual(tasks[2].done, true);

});

test('Sdk.tasks.create adds a new task and it appears in list', async function () {

  const sdk = createSdk();

  await sdk.tasks.create('New task');
  const tasks = await sdk.tasks.list();

  assert.strictEqual(tasks.length, 4);
  assert.strictEqual(tasks[3].title, 'New task');
  assert.strictEqual(tasks[3].done, false);

});

test('Sdk.tasks.toggle flips the done flag of an existing task', async function () {

  const sdk = createSdk();

  await sdk.tasks.toggle(1);
  const tasks = await sdk.tasks.list();

  const task1 = tasks.find(function (t) { return t.id === 1; });
  assert.strictEqual(task1.done, true);

});

test('Sdk.tasks.remove deletes a task by id', async function () {

  const sdk = createSdk();

  await sdk.tasks.remove(2);
  const tasks = await sdk.tasks.list();

  assert.strictEqual(tasks.length, 2);
  const task2 = tasks.find(function (t) { return t.id === 2; });
  assert.strictEqual(task2, undefined);

});

test('Sdk.tasks.toggle on a nonexistent id does not throw', async function () {

  const sdk = createSdk();

  await sdk.tasks.toggle(999);

  const tasks = await sdk.tasks.list();
  assert.strictEqual(tasks.length, 3);

});


// ============================================================================
// 5. SDK - notes CRUD
// ============================================================================

test('Sdk.notes.list returns the initial seed notes', async function () {

  const sdk = createSdk();

  const notes = await sdk.notes.list();

  assert.strictEqual(notes.length, 1);
  assert.strictEqual(notes[0].title, 'First note');

});

test('Sdk.notes.create adds a new note and it appears in list', async function () {

  const sdk = createSdk();

  await sdk.notes.create('My note', 'Some body text');
  const notes = await sdk.notes.list();

  assert.strictEqual(notes.length, 2);
  assert.strictEqual(notes[1].title, 'My note');
  assert.strictEqual(notes[1].body, 'Some body text');

});

test('Sdk.notes.remove deletes a note by id', async function () {

  const sdk = createSdk();

  await sdk.notes.remove(1);
  const notes = await sdk.notes.list();

  assert.strictEqual(notes.length, 0);

});


// ============================================================================
// 6. SDK - instance isolation
// ============================================================================

test('two SDK instances do not share state', async function () {

  const sdkA = createSdk();
  const sdkB = createSdk();

  await sdkA.tasks.create('from A');
  const tasksA = await sdkA.tasks.list();
  const tasksB = await sdkB.tasks.list();

  assert.strictEqual(tasksA.length, 4);
  assert.strictEqual(tasksB.length, 3);

});
