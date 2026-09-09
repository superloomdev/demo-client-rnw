// Info: Tasks shape layout. Establishes this shape's theme by wrapping its stack in
// a ThemeProvider with the tasks (indigo) VARIANT. The header is branded from the
// DERIVED theme (primary background + auto-contrast title), so switching shapes
// visibly re-themes everything from one variant value.
import { Stack } from 'expo-router';
import { useLib } from '../../../../src/app-core/contexts/lib-context.js';


// Inner stack so we can read the derived theme for header styling
function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Tasks',
        headerStyle: { backgroundColor: theme['color.interactive'] },
        headerTintColor: theme['color.text_on_color'],
        headerTitleStyle: { fontWeight: '600' }
      }}
    />
  );
}


export default function TasksLayout () {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider scheme="white" brand="tasks">
      <ThemedStack />
    </ThemeProvider>
  );
}
