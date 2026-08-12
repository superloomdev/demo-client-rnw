// Info: Notes shape layout. Same mechanism as the Tasks shape, but with the notes
// (teal) VARIANT — including a larger type ratio — proving a shape can re-shape both
// color and the numeric scale from the same engine.
import { Stack } from 'expo-router';

const { useLib } = require('../../../../src/app-core/contexts/lib-context');


function ThemedStack () {
  const { useTheme } = useLib().ThemeContext;
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Notes',
        headerStyle: { backgroundColor: theme.Color.APP_PRIMARY },
        headerTintColor: theme.Color.TEXT_ON_PRIMARY,
        headerTitleStyle: { fontWeight: '600' },
      }}
    />
  );
}


export default function NotesLayout () {
  const Lib = useLib();
  const { ThemeProvider } = Lib.ThemeContext;
  return (
    <ThemeProvider variant={Lib.Themes.notes}>
      <ThemedStack />
    </ThemeProvider>
  );
}
