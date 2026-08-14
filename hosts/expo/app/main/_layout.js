// Info: Main app (launcher) layout. Wraps the super-app shell in a ThemeProvider
// with no variant — the launcher uses the neutral host base theme. ThemeProvider
// and the theming hooks come from the DI container (Lib.ThemeContext).
import { Stack } from 'expo-router';

const { useLib } = require('../../../../src/app-core/contexts/lib-context');


// Inner stack so we can read the derived theme for header styling
function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Nimbus',
        headerStyle: { backgroundColor: theme.Color.APP_PRIMARY },
        headerTintColor: theme.Color.TEXT_ON_PRIMARY,
        headerTitleStyle: { fontWeight: '600' }
      }}
    />
  );
}


export default function MainLayout () {
  const { ThemeProvider } = useLib().ThemeContext;
  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
