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


// Themed wrapper for shape screens. Each app gets its own profile and brand.
// The launcher uses Material light with no brand. Tasks uses Carbon. Notes
// uses Material. The showcase uses Carbon by default and lets the user switch.
function ThemedScreen ({ Screen, profile, scheme, brand }) {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider profile={profile} scheme={scheme} brand={brand}>
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
  // every route needs a ThemeProvider. The launcher uses Material light with
  // no brand. Tasks uses Carbon with the tasks brand. Notes uses Material
  // with the notes brand. The showcase uses Carbon by default.
  let profile = 'material';
  let scheme = 'light';
  let brand = null;
  if (path === '/tasks') {
    profile = 'carbon';
    scheme = 'white';
    brand = 'tasks';
  } else if (path === '/notes') {
    profile = 'material';
    scheme = 'light';
    brand = 'notes';
  } else if (path.indexOf('/showcase') === 0) {
    profile = 'carbon';
    scheme = 'white';
    brand = 'tasks';
  }

  return (
    <SafeAreaProvider>
      <ThemedScreen Screen={Screen} profile={profile} scheme={scheme} brand={brand} />
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
