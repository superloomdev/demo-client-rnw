const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch src/ (two levels up) for components + screens + client
const SRC_ROOT = path.resolve(__dirname, '../..');
const HELPERS_ROOT = path.resolve(
  __dirname,
  '../../../../../codebase-js-helper-modules/src/helper-modules-core'
);

config.watchFolders = [...(config.watchFolders || []), SRC_ROOT, HELPERS_ROOT];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@superloomdev/js-helper-utils': path.join(HELPERS_ROOT, 'js-helper-utils'),
  '@superloomdev/js-helper-debug': path.join(HELPERS_ROOT, 'js-helper-debug'),
};

config.resolver.blockList = [
  /helper-modules-core[\\/].*[\\/]_test[\\/].*/,
  /helper-modules-core[\\/].*[\\/]node_modules[\\/].*/,
];

module.exports = config;
