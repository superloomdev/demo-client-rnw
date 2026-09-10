// Info: Showcase shape layout. Same mechanism as the Tasks/Notes shapes.
// The showcase uses the Carbon profile by default and lets the user
// switch profiles and schemes at runtime via the ThemeSelector.
import { Stack } from 'expo-router';
import { useLib } from '../../../../src/app-core/contexts/lib-context.js';


// Inner stack so we can read the derived theme for header styling
function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Components',
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
    <ThemeProvider profile="carbon" scheme="white" brand="tasks">
      <ThemedStack />
    </ThemeProvider>
  );
}
