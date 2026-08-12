// Info: Metro bundler config — the SINGLE pipeline for web (RNW) + iOS + Android.
//
// All Superloom helper modules are consumed from the GitHub Packages registry
// as normal npm dependencies. The exception is js-client-helper-font-ext-expo,
// which is not yet published to the registry — it is consumed via a file:
// reference to the helper-modules source tree. Metro does not follow symlinks
// by default, so we add the source directory to watchFolders and map the
// module name in extraNodeModules.
//
// The src/ directory is watched because shared source (screens, components,
// themes, fonts, app-core) lives outside the Expo project root.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Start from Expo's default Metro config
const config = getDefaultConfig(__dirname);

// src/ root — shared source lives here, outside the Expo project root
const SRC_ROOT = path.resolve(__dirname, '../../src');

// Helper-modules source root — ext-expo lives here (not yet published to registry)
const HELPER_MODULES_ROOT = path.resolve(__dirname, '../../../codebase-js-helper-modules/src/helper-modules-client');

// Tell Metro to watch both directories outside the Expo project root
config.watchFolders = [...(config.watchFolders || []), SRC_ROOT, HELPER_MODULES_ROOT];

const CLIENT_MODULES = path.resolve(__dirname, 'node_modules');

// ext-expo is not published to the registry; map it to source.
config.resolver.extraNodeModules = {
  '@superloomdev/js-client-helper-font-ext-expo': path.join(HELPER_MODULES_ROOT, 'js-client-helper-font-ext-expo')
};

config.resolver.nodeModulesPaths = [CLIENT_MODULES];

module.exports = config;
