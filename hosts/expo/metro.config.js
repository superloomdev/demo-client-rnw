// Info: Metro bundler config - the SINGLE pipeline for web (RNW) + iOS + Android.
//
// All Superloom helper modules are consumed from the GitHub Packages registry
// as normal npm dependencies.
//
// The src/ directory is watched because shared source (screens, components,
// themes, fonts, app-core) lives outside the Expo project root.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Start from Expo's default Metro config
const config = getDefaultConfig(__dirname);

// src/ root - shared source lives here, outside the Expo project root
const SRC_ROOT = path.resolve(__dirname, '../../src');

// Tell Metro to watch the shared source directory outside the Expo project root
config.watchFolders = [...(config.watchFolders || []), SRC_ROOT];

const CLIENT_MODULES = path.resolve(__dirname, 'node_modules');

config.resolver.nodeModulesPaths = [CLIENT_MODULES];

module.exports = config;
