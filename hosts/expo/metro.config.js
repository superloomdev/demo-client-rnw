// Info: Metro bundler config — the SINGLE pipeline for web (RNW) + iOS + Android.
//
// All Superloom helper modules are consumed from the GitHub Packages registry
// as normal npm dependencies. The exception is js-client-helper-font-ext-expo,
// which is not yet published to the registry — it is consumed via a file:
// reference to the helper-modules source tree. Metro does not follow symlinks
// by default, so we add the source directory to watchFolders and map the
// module name in extraNodeModules.
//
// The packages/ directory is also watched because screen components live
// outside the Expo project root.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Start from Expo's default Metro config
const config = getDefaultConfig(__dirname);

// packages/ root — screens live here, outside the Expo project root
const PACKAGES_ROOT = path.resolve(__dirname, '../../packages');

// Helper-modules source root — ext-expo lives here (not yet published to registry)
const HELPER_MODULES_ROOT = path.resolve(__dirname, '../../../codebase-js-helper-modules/src/helper-modules-client');

// Tell Metro to watch both directories outside the Expo project root
config.watchFolders = [...(config.watchFolders || []), PACKAGES_ROOT, HELPER_MODULES_ROOT];

// node_modules for the packages/ tree — screens have no local node_modules,
// so point all bare specifiers to the Expo host's node_modules.
// Also map ext-expo to its source directory (file: symlink workaround for Metro).
const CLIENT_MODULES = path.resolve(__dirname, 'node_modules');

config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: function (target, name) {
      if (name === '@superloomdev/js-client-helper-font-ext-expo') {
        return path.join(HELPER_MODULES_ROOT, 'js-client-helper-font-ext-expo');
      }
      return name in target
        ? target[name]
        : path.join(CLIENT_MODULES, name);
    },
  }
);

module.exports = config;
