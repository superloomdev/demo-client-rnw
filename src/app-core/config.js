// Info: Static configuration defaults for the Nimbus super-app demo.
// Mirrors the server project config pattern: grouped sub-configs per concern.
// Loader reads this and merges environment / runtime overrides on top.
'use strict';


module.exports = {

  // ========================= APP IDENTITY ========================= //

  APP_NAME: 'Nimbus',
  ENVIRONMENT: 'development',


  // ========================= SUPER-APP ========================= //

  // MODE = 'super' -> entry shows a launcher to choose an app shape.
  // MODE = 'lean'  -> entry boots straight into app_shape (single-purpose build).
  super_app: {
    MODE: 'super',
    APP_SHAPE: 'tasks',
    AVAILABLE_SHAPES: ['tasks', 'notes', 'showcase']
  },


  // ========================= LOCALIZATION ========================= //

  locale: {
    DEFAULT_LANGUAGE: 'en',
    IS_RTL: false
  },


  // ========================= DEBUG ========================= //

  // Keys match @superloomdev/js-helper-debug config
  debug: {
    LOG_LEVEL: 'debug',
    LOG_FORMAT: 'text',
    INCLUDE_STACK_TRACE: false,
    INCLUDE_MEMORY_USAGE: false,  // Node-only; guarded in the module
    APP_NAME: 'Nimbus',
    ENVIRONMENT: 'development'
  },


  // ========================= SDK ========================= //

  // Simulated network latency (ms) so the mock SDK behaves like a real async API.
  sdk: {
    API_LATENCY_MS: 350
  }

};
