// Info: Launcher screen - the super-app entry point.
// Displays shape cards in super mode, or redirects in lean mode.
// Thin screen component: all routing logic stays in app/main/index.js wrapper.
import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLib } from '../../app-core/contexts/lib-context.js';


export default function Launcher () {

  // Resolve the live lib, navigation helpers, and themed components for rendering
  const Lib = useLib();
  const { Link, Redirect } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const theme = Lib.ThemeContext.useTheme();

  // Determine which app shape to show based on the super-app decision
  const decision = Lib.SuperApp.determineApp();

  // In lean mode there is only one shape, so redirect immediately
  if (decision.mode === 'lean') {
    // Redirect to the single shape's route
    return <Redirect href={decision.shape.route} />;
  }

  // List all available shapes for the super-mode launcher grid
  const shapes = Lib.SuperApp.listShapes();

  // Render the launcher grid with one card per shape
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme['color.background'] }]}>
      <ScrollView contentContainerStyle={styles.content}>

        <C.Text typeSet="heading04" weight="bold">Nimbus</C.Text>
        <C.Text typeSet="body01" color="text_secondary" style={styles.subtitle}>
          One core, many apps. Pick one to launch.
        </C.Text>

        {shapes.map(function (shape) {
          // Render one navigable card per shape
          return (
            <Link key={shape.key} href={shape.route} asChild>
              <Pressable style={styles.cardWrap}>
                <C.View background="layer_02" radius="radius_08" border={true} style={styles.card}>
                  <C.View background="layer_accent_01" radius="radius_04" style={styles.iconWrap}>
                    <C.Icon name={shape.icon} size="xxl" color="interactive" />
                  </C.View>
                  <C.View style={styles.cardText}>
                    <C.Text typeSet="heading02" weight="semibold">{shape.label}</C.Text>
                    <C.Text color="text_secondary">{shape.tagline}</C.Text>
                  </C.View>
                  <C.Icon name="chevron_right" size="lg" color="text_secondary" />
                </C.View>
              </Pressable>
            </Link>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  subtitle: { marginBottom: 12 },
  cardWrap: { width: '100%' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  iconWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 }
});
