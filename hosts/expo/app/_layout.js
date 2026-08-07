// Info: Root layout — the app boot. Builds the Lib container (LibProvider), the
// safe-area context, gates render on font loading (Lib.Fonts), and wraps the app
// in a BASE ThemeProvider (used by the launcher). Each app shape under
// app/[shape]/ nests its own ThemeProvider, so this base theme only styles the
// super-app launcher. The headerless Stack lets each shape own its header.
//
// ThemeProvider + the font gate come from the DI container (Lib.ThemeContext,
// Lib.Fonts), so this file holds no theming logic of its own.
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { LibProvider, useLib } = require('../contexts/lib-context');


// Inner boot: hold render until host fonts are ready, then provide the base theme
function Boot () {

  const Lib = useLib();
  const React = Lib.React;

  // Load fonts asynchronously via the font helper adapter
  const [fontsReady, setFontsReady] = React.useState(Lib.Fonts.isReady());

  React.useEffect(function () {

    // Already ready (system-only build) — skip the async load
    if (Lib.Fonts.isReady()) {
      return;
    }

    // Trigger the async font load, then flip the ready flag
    Lib.Fonts.loadFonts().then(function () {
      setFontsReady(true);
    });

  }, []);

  // Block render until every registered font family has loaded (system/Google/custom)
  if (!fontsReady) {
    return null;
  }

  // Base ThemeProvider from the DI container styles the launcher
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );

}


export default function RootLayout () {
  return (
    <LibProvider>
      <SafeAreaProvider>
        <Boot />
      </SafeAreaProvider>
    </LibProvider>
  );
}
