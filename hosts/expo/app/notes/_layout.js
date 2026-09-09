// Info: Notes shape layout. Same mechanism as the Tasks shape, but with the notes
// (teal) VARIANT - including a larger type ratio - proving a shape can re-shape both
// color and the numeric scale from the same engine.
import { Stack } from 'expo-router';
import { useLib } from '../../../../src/app-core/contexts/lib-context.js';


function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Notes',
        headerStyle: { backgroundColor: theme['color.interactive'] },
        headerTintColor: theme['color.text_on_color'],
        headerTitleStyle: { fontWeight: '600' }
      }}
    />
  );
}


export default function NotesLayout () {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider scheme="white" brand="notes">
      <ThemedStack />
    </ThemeProvider>
  );
}
