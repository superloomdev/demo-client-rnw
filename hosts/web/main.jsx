// Info: Web harness entry point. Renders the Launcher screen from shared source
// to prove the portability contract: src/ builds under a non-Expo bundler.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { LibProvider } = require('../../src/app-core/contexts/lib-context');
const navigationAdapter = require('./adapters/navigation');
const fontsAdapter = require('./adapters/fonts');
const iconsAdapter = require('./adapters/icons');
const Launcher = require('../../src/screens/main/Launcher').default;

function App () {
  return (
    <SafeAreaProvider>
      <Launcher />
    </SafeAreaProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <LibProvider adapters={{ Navigation: navigationAdapter, Fonts: fontsAdapter, Icons: iconsAdapter }}>
    <App />
  </LibProvider>
);
