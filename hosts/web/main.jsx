// Info: Web harness entry point. Renders the super-app from shared source
// to prove the portability contract: src/ builds under a non-Expo bundler.
// Supports path-based routing so E2E tests can drive every app shape.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LibProvider, useLib } from '../../src/app-core/contexts/lib-context.js';
import * as navigationAdapterMod from './adapters/navigation.js';
import * as fontsAdapterMod from './adapters/fonts.js';
import * as iconsAdapterMod from './adapters/icons.js';

import Launcher from '../../src/screens/main/Launcher.js';
import TasksList from '../../src/screens/tasks/TasksList.js';
import NotesList from '../../src/screens/notes/NotesList.js';
import ShowcaseIndex from '../../src/screens/showcase/ShowcaseIndex.js';
import AtomGallery from '../../src/screens/showcase/AtomGallery.js';
import MoleculeGallery from '../../src/screens/showcase/MoleculeGallery.js';
import CompositeGallery from '../../src/screens/showcase/CompositeGallery.js';
import ProviderGallery from '../../src/screens/showcase/ProviderGallery.js';
import CarbonParity from '../../src/screens/showcase/CarbonParity.js';

const navigationAdapter = navigationAdapterMod.default;
const fontsAdapter = fontsAdapterMod.default;
const iconsAdapter = iconsAdapterMod.default;


// Route table: pathname -> screen component
// A11yInspector is excluded - it requires react-test-renderer (test-only dep)
const ROUTES = {
  '/': Launcher,
  '/tasks': TasksList,
  '/notes': NotesList,
  '/showcase': ShowcaseIndex,
  '/showcase/atoms': AtomGallery,
  '/showcase/molecules': MoleculeGallery,
  '/showcase/composites': CompositeGallery,
  '/showcase/providers': ProviderGallery,
  '/showcase/parity': CarbonParity
};


// Themed wrapper for shape screens (tasks, notes, showcase)
function ThemedScreen ({ Screen, brand, scheme }) {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider scheme={scheme || 'white'} brand={brand}>
      <Screen />
    </ThemeProvider>
  );
}


// Router: listens to popstate and renders the matching screen
function Router () {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(function () {
    function onPop () {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', onPop);
    return function () {
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const Screen = ROUTES[path] || Launcher;

  // Apply shape-specific theming. Every screen uses themed components, so
  // every route needs a ThemeProvider. The launcher uses the white scheme
  // with no brand overlay.
  let brand = null;
  let scheme = 'white';
  if (path === '/tasks') {
    brand = 'tasks';
  } else if (path === '/notes') {
    brand = 'notes';
  } else if (path.indexOf('/showcase') === 0) {
    scheme = 'white';
    brand = 'tasks';
  }

  return (
    <SafeAreaProvider>
      <ThemedScreen Screen={Screen} brand={brand} scheme={scheme} />
    </SafeAreaProvider>
  );
}


function App () {
  return <Router />;
}

const root = createRoot(document.getElementById('root'));
root.render(
  <LibProvider adapters={{ Navigation: navigationAdapter, Fonts: fontsAdapter, Icons: iconsAdapter }}>
    <App />
  </LibProvider>
);
