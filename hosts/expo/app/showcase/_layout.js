// Info: Showcase shape layout. Same mechanism as the Tasks/Notes shapes, but
// themed with the tasks (indigo) VARIANT. The Carbon component showcase is a
// read-only gallery, so the tasks accent is a neutral, brand-consistent skin.
import { Stack } from 'expo-router';
import { useLib } from '../../../../src/app-core/contexts/lib-context.js';


// Inner stack so we can read the derived theme for header styling
function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Carbon Components',
        headerStyle: { backgroundColor: theme['color.interactive'] },
        headerTintColor: theme['color.text_on_color'],
        headerTitleStyle: { fontWeight: '600' }
      }}
    />
  );
}


export default function ShowcaseLayout () {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider scheme="white" brand="tasks">
      <ThemedStack />
    </ThemeProvider>
  );
}
