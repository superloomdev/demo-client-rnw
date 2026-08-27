// Info: Web harness entry point. Renders the super-app from shared source
// to prove the portability contract: src/ builds under a non-Expo bundler.
// Supports path-based routing so E2E tests can drive every app shape.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LibProvider, useLib } from '../../src/app-core/contexts/lib-context';
import * as navigationAdapterMod from './adapters/navigation';
import * as fontsAdapterMod from './adapters/fonts';
import * as iconsAdapterMod from './adapters/icons';

import Launcher from '../../src/screens/main/Launcher';
import TasksList from '../../src/screens/tasks/TasksList';
import NotesList from '../../src/screens/notes/NotesList';
import ShowcaseIndex from '../../src/screens/showcase/ShowcaseIndex';
import AtomGallery from '../../src/screens/showcase/AtomGallery';
import MoleculeGallery from '../../src/screens/showcase/MoleculeGallery';
import CompositeGallery from '../../src/screens/showcase/CompositeGallery';
import ProviderGallery from '../../src/screens/showcase/ProviderGallery';
import CarbonParity from '../../src/screens/showcase/CarbonParity';

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
function ThemedScreen ({ Screen, variant }) {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  if (variant && Lib.Themes[variant]) {
    return (
      <ThemeProvider variant={Lib.Themes[variant]}>
        <Screen />
      </ThemeProvider>
    );
  }
  // Base theme for the launcher (no variant = base scheme)
  return (
    <ThemeProvider>
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

  // Apply shape-specific theming
  let variant = null;
  if (path === '/tasks') {
    variant = 'tasks';
  } else if (path === '/notes') {
    variant = 'notes';
  } else if (path.indexOf('/showcase') === 0) {
    variant = 'tasks';
  }

  return (
    <SafeAreaProvider>
      <ThemedScreen Screen={Screen} variant={variant} />
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
