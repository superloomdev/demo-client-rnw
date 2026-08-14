// Info: Tasks shape layout. Establishes this shape's theme by wrapping its stack in
// a ThemeProvider with the tasks (indigo) VARIANT. The header is branded from the
// DERIVED theme (primary background + auto-contrast title), so switching shapes
// visibly re-themes everything from one variant value.
import { Stack } from 'expo-router';

const { useLib } = require('../../../../src/app-core/contexts/lib-context');


// Inner stack so we can read the derived theme for header styling
function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Tasks',
        headerStyle: { backgroundColor: theme.Color.APP_PRIMARY },
        headerTintColor: theme.Color.TEXT_ON_PRIMARY,
        headerTitleStyle: { fontWeight: '600' }
      }}
    />
  );
}


export default function TasksLayout () {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider variant={Lib.Themes.tasks}>
      <ThemedStack />
    </ThemeProvider>
  );
}
