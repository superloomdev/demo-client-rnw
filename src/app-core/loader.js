// Info: Client-app bootstrap and dependency injection root.
// Loads all dependencies, merges config, builds Lib and Config.
// Pattern: load foundation helpers first, then platform utils, then app modules.
// Returns { Lib, Config } — same contract as the server loader.
// Memoization is owned by the React context provider (lib-context.js), not here.
'use strict';

const { Validators } = require('./loader.validators');


/////////////////////////// Module-Loader START ////////////////////////////////

/********************************************************************
Pure loader. Builds a fresh Lib + Config pair from the host-supplied
adapter set. Called once per provider mount; the provider memoizes.

@param {Object} adapters         - Host-supplied adapter factories
@param {Object} adapters.Navigation - (Lib, config) => { Link, Redirect }
@param {Object} adapters.Icons    - (Lib, config) => { Glyph }
@param {Object} adapters.Fonts    - (Lib, config) => { adapter, manifest }

@return {Object} result         - Runtime objects
@return {Object} result.Lib     - Dependency container with all loaded modules
@return {Object} result.Config  - Fully resolved application configuration
*********************************************************************/
module.exports = function loader (adapters) {

  // Gate: every host must supply all three adapter slots
  Validators.validateAdapters(adapters);


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

  const config_sdk = { // eslint-disable-line no-unused-vars
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

  // React extension for the themer: provides ThemeProvider, useTheme, useTokens,
  // useThemeController, and ThemeContext. Factory pattern - each call returns an
  // independent instance with its own React context.
  Lib.ThemerReact = require('@superloomdev/js-client-helper-themer-ext-react')({
    React: Lib.React,
    Themer: Lib.Themer,
    Utils: Lib.Utils,
    Debug: Lib.Debug
  });


  // ==================== FONTS + THEMES ============================= //
  // The font core is shared; the platform loader and asset manifest arrive
  // through the Fonts adapter. Themes are static data loaded directly.
  //   Lib.Font         - the font core (family registry + role resolution)
  //   Lib.FontAdapter  - the platform font loader (from the Fonts adapter)
  //   Lib.FontManifest - host-owned font asset sources (from the Fonts adapter)
  //   Lib.Fonts        - font manifest (families + loadFonts async gate)
  //   Lib.Themes       - theme-data map ({ base, tasks, notes }) - loaded directly
  //   Lib.ThemeContext - React theming hub (ThemeProvider + hooks); needs Fonts + Themer

  Lib.Font = require('@superloomdev/js-client-helper-font')(Lib, {
    DEFAULT_FAMILY: 'System'
  });
  Lib.Themes = {
    base:  require('../themes/base-theme'),
    tasks: require('../themes/tasks-theme'),
    notes: require('../themes/notes-theme')
  };


  // ==================== SDK ======================================= //
  // The hand-written dummy SDK was retired during promotion. The real SDK
  // (generated from the backend API surface) will be injected here once it is
  // published. Until then, a stub SDK provides in-memory data so screens can
  // render without crashing.

  // Lib.Sdk = require('@superloomdev/js-demo-sdk')(Lib, config_sdk);
  Lib.Sdk = _stubSdk();


  // ==================== ADAPTER INJECTIONS ========================= //
  // Capabilities that cannot be shared (navigation, icons, platform font
  // loading) enter through adapters. Each adapter is a factory that receives
  // Lib and returns a ready object; the loader assigns it to the slot.
  // Adapters never mutate Lib directly.

  const fontsResult = adapters.Fonts(Lib, {});
  Lib.FontAdapter = fontsResult.adapter;
  Lib.FontManifest = fontsResult.manifest;

  Lib.Icons = adapters.Icons(Lib, {});

  Lib.Navigation = adapters.Navigation(Lib, {});

  // Font manifest needs the platform adapter (Lib.FontAdapter) set by the
  // Fonts adapter before it can build
  Lib.Fonts = require('../fonts/fonts')(Lib);

  // Theme context needs Lib.Fonts (for font-family validation + async loading)
  Lib.ThemeContext = require('./contexts/theme-context')(Lib);


  // ==================== CARBON COMPONENTS ======================== //
  // The published Carbon component library (factory). Screens build the themed
  // registry from this via the showcase carbon-registry hook, so the showcase
  // always iterates the live package roster instead of a hardcoded list.
  Lib.CarbonComponents = require('@superloomdev/rnw-components-carbon');


  // First boot log
  Lib.Debug.info('Lib built', { platform: Lib.Client.os(), mode: Config.super_app.MODE });


  // Return
  return { Lib, Config };

};///////////////////////////// Module-Loader END ///////////////////////////////



///////////////////////////// Private Functions ////////////////////////////////
// In-memory stub SDK. Replaces the retired dummy SDK until the real generated
// SDK is published. Provides basic CRUD for tasks and notes.

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
      list: function () {
        return Promise.resolve(tasks.slice());
      },
      create: function (title) {
        tasks.push({ id: nextTaskId++, title: title, done: false }); return Promise.resolve();
      },
      toggle: function (id) {
        const t = tasks.find(function (x) {
          return x.id === id;
        }); if (t) {
          t.done = !t.done;
        } return Promise.resolve();
      },
      remove: function (id) {
        tasks = tasks.filter(function (x) {
          return x.id !== id;
        }); return Promise.resolve();
      }
    },
    notes: {
      list: function () {
        return Promise.resolve(notes.slice());
      },
      create: function (title, body) {
        notes.push({ id: nextNoteId++, title: title, body: body, updatedAt: 'just now' }); return Promise.resolve();
      },
      remove: function (id) {
        notes = notes.filter(function (x) {
          return x.id !== id;
        }); return Promise.resolve();
      }
    }
  };

}
