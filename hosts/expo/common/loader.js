// Info: Client-app bootstrap and dependency injection root.
// Loads all dependencies, merges config, builds Lib and Config.
// Pattern: load foundation helpers first, then platform utils, then app modules.
// Returns { Lib, Config } — same contract as the server loader.
'use strict';


// Memoized singleton — web fast-refresh and repeated mounts reuse the same instance
let _result = null;


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Singleton loader. Builds (or returns the cached) Lib + Config pair.

@return {Object} result         - Runtime objects
@return {Object} result.Lib     - Dependency container with all loaded modules
@return {Object} result.Config  - Fully resolved application configuration
*********************************************************************/
module.exports = function loader () {

  // Return cached instance if already built
  if (_result !== null) {
    return _result;
  }


  // ========================= CONFIGURATION ========================= //

  // Load static config
  const static_config = require('./config');

  // Merge static config with any runtime overrides (extend as needed per environment)
  const Config = {
    ...static_config,
    super_app: { ...static_config.super_app },
    locale: { ...static_config.locale },
    debug: {
      ...static_config.debug,
      ENVIRONMENT: static_config.ENVIRONMENT
    },
    sdk: { ...static_config.sdk }
  };

  // Sub-configs: each helper module receives ONLY its relevant config slice
  const config_debug = {
    LOG_LEVEL: Config.debug.LOG_LEVEL,
    LOG_FORMAT: Config.debug.LOG_FORMAT,
    INCLUDE_STACK_TRACE: Config.debug.INCLUDE_STACK_TRACE,
    INCLUDE_MEMORY_USAGE: Config.debug.INCLUDE_MEMORY_USAGE,
    APP_NAME: Config.debug.APP_NAME,
    ENVIRONMENT: Config.debug.ENVIRONMENT
  };

  const config_sdk = {
    API_LATENCY_MS: Config.sdk.API_LATENCY_MS
  };


  // ==================== DEPENDENCY CONTAINER ======================= //

  const Lib = {};


  // Expose Config on Lib so components/helpers can read it via Lib.Config
  Lib.Config = Config;


  // ==================== HELPER MODULES ============================= //
  // Zero-dependency core helpers — same packages the server uses, run unchanged in RNW/Metro.
  // Each receives Lib + ONLY its relevant sub-config.

  Lib.Utils = require('@superloomdev/js-helper-utils')(Lib, {});
  Lib.Debug = require('@superloomdev/js-helper-debug')(Lib, config_debug);


  // ==================== PLATFORM MODULES ========================== //
  // Client-side utilities with no server equivalent.

  Lib.Client = require('./client')(Lib, Config);
  Lib.SuperApp = require('./superApp')(Lib, Config);


  // ==================== THEMER ==================================== //
  // Carbon-vocabulary token engine with ramp rules, type sets, shadows,
  // platform emit, and contrast correction. Resolves templates against
  // layered overrides (base + variant) and emits platform-ready values.
  //   Lib.React  - the centralized React lib
  //   Lib.Themer - the Themer instance (buildTheme)

  Lib.React = require('react');
  Lib.Themer = require('@superloomdev/js-client-helper-themer')(Lib, {});


  // ==================== FONTS + THEMES ============================= //
  // The host owns fonts (loading the families themes name) and themes (the scheme
  // data + the React theming context). All are DI loaders sharing the same Lib.
  //   Lib.Font         - the font core (family registry + role resolution)
  //   Lib.FontAdapter  - the platform font loader adapter (ext-expo for Expo host)
  //   Lib.Fonts        - font manifest (families + loadFonts async gate)
  //   Lib.Themes       - theme-data map ({ base, tasks, notes }) - loaded directly
  //   Lib.ThemeContext - React theming hub (ThemeProvider + hooks); needs Themes + Themer

  Lib.Font = require('@superloomdev/js-client-helper-font')(Lib, {
    DEFAULT_FAMILY: 'System'
  });
  Lib.FontAdapter = require('@superloomdev/js-client-helper-font-ext-expo')(Lib, {});
  Lib.Fonts = require('../fonts/fonts')(Lib);
  Lib.Themes = {
    base:  require('../themes/base-theme'),
    tasks: require('../themes/tasks-theme'),
    notes: require('../themes/notes-theme')
  };
  Lib.ThemeContext = require('../contexts/theme-context')(Lib);


  // ==================== SDK ======================================= //
  // The hand-written dummy SDK was retired during promotion. The real SDK
  // (generated from the backend API surface, Plan 0046) will be injected here
  // once it is published. Until then, a stub SDK provides in-memory data so
  // screens can render without crashing.

  // Lib.Sdk = require('@superloomdev/js-demo-sdk')(Lib, config_sdk);
  Lib.Sdk = _stubSdk();


  // First boot log
  Lib.Debug.info('Lib built', { platform: Lib.Client.os(), mode: Config.super_app.MODE });


  // Cache + return
  _result = { Lib, Config };
  return _result;

};///////////////////////////// Module-Loader END ///////////////////////////////



///////////////////////////// Private Functions ////////////////////////////////
// In-memory stub SDK. Replaces the retired dummy SDK until Plan 0046 publishes
// the real generated SDK. Provides basic CRUD for tasks and notes.

function _stubSdk () {

  let tasks = [
    { id: 1, title: 'Welcome to Nimbus', done: false },
    { id: 2, title: 'Try the theme showcase', done: false },
    { id: 3, title: 'Shuffle the accent color', done: true }
  ];
  let notes = [
    { id: 1, title: 'First note', body: 'This is a stub note from the in-memory SDK.', updatedAt: 'just now' }
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
