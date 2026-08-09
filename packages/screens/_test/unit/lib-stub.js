'use strict';

// Test Lib stub — provides the minimal interface that screens consume.
// Replaces the full Lib built by hosts/expo/common/loader.js with
// in-memory fakes for ThemeContext, SuperApp, Sdk, Utils, and Themes.

const React = require('react');

// --- Stub themed components ---

function makeComponent (name) {
  return function (props) {
    return React.createElement(name, props, props && props.children);
  };
}

const stubComponents = {
  Text: makeComponent('Text'),
  View: makeComponent('View'),
  Card: makeComponent('Card'),
  Icon: makeComponent('Icon'),
  ButtonPrimary: makeComponent('ButtonPrimary'),
  TextInput: makeComponent('TextInput'),
  variant: {
    ButtonPrimaryTypeA: makeComponent('ButtonPrimaryTypeA')
  },
  freeform: {
    RawBox: makeComponent('RawBox')
  }
};

// --- Theme context stub ---
// Returns stub components directly without React context, so screens
// can render without a ThemeProvider wrapper.

const ThemeContext = {
  ThemeContext: React.createContext(null),
  ThemeProvider: function (props) {
    return React.createElement(React.Fragment, null, props && props.children);
  },
  useComponents: function () {
    return stubComponents;
  },
  useThemeController: function () {
    return { updateTheme: function () {} };
  },
  useTheme: function () {
    return { Color: {}, Dimension: {}, Font: { family: { body: 'System' } } };
  },
  useStyles: function () {
    return {};
  }
};

// --- SuperApp stub ---

function createSuperApp (mode, shapes) {
  return {
    listShapes: function () { return shapes; },
    getShape: function (key) {
      return shapes.find(function (s) { return s.key === key; }) || null;
    },
    determineApp: function () {
      if (mode === 'lean') {
        return { mode: 'lean', shape: shapes[0] };
      }
      return { mode: 'super' };
    }
  };
}

// --- SDK stub (in-memory CRUD) ---

function createSdk () {
  let tasks = [
    { id: 1, title: 'Welcome to Nimbus', done: false },
    { id: 2, title: 'Try the theme showcase', done: false },
    { id: 3, title: 'Shuffle the accent color', done: true }
  ];
  let notes = [
    { id: 1, title: 'First note', body: 'Stub note body.', updatedAt: 'just now' }
  ];
  let nextTaskId = 4;
  let nextNoteId = 2;

  return {
    tasks: {
      list: function () { return Promise.resolve(tasks.slice()); },
      create: function (title) { tasks.push({ id: nextTaskId++, title: title, done: false }); return Promise.resolve(); },
      toggle: function (id) { var t = tasks.find(function (x) { return x.id === id; }); if (t) t.done = !t.done; return Promise.resolve(); },
      remove: function (id) { tasks = tasks.filter(function (x) { return x.id !== id; }); return Promise.resolve(); }
    },
    notes: {
      list: function () { return Promise.resolve(notes.slice()); },
      create: function (title, body) { notes.push({ id: nextNoteId++, title: title, body: body, updatedAt: 'just now' }); return Promise.resolve(); },
      remove: function (id) { notes = notes.filter(function (x) { return x.id !== id; }); return Promise.resolve(); }
    }
  };
}

// --- Utils stub ---

const Utils = {
  isEmpty: function (s) { return s === null || s === undefined || s === ''; },
  isString: function (v) { return typeof v === 'string'; },
  isObject: function (v) { return v !== null && typeof v === 'object'; },
  isNullOrUndefined: function (v) { return v === null || v === undefined; }
};

// --- Build a Lib for testing ---

function createLib (options) {
  options = options || {};
  const shapes = options.shapes || [
    { key: 'tasks', label: 'Tasks', tagline: 'Plan your day', icon: 'checkbox-outline', route: '/tasks' },
    { key: 'notes', label: 'Notes', tagline: 'Capture thoughts', icon: 'document-text-outline', route: '/notes' }
  ];

  return {
    ThemeContext: ThemeContext,
    SuperApp: createSuperApp(options.mode || 'super', shapes),
    Sdk: options.sdk || createSdk(),
    Utils: Utils,
    Themes: {
      tasks: { font: { family: 'System' } },
      notes: { font: { family: 'System' } },
      base: {}
    }
  };
}

module.exports = {
  createLib: createLib,
  createSdk: createSdk,
  createSuperApp: createSuperApp,
  stubComponents: stubComponents,
  Utils: Utils
};
