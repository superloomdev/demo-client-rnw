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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <C.Text size="xxl" weight="bold">Nimbus</C.Text>
        <C.Text size="md" color="text_secondary" style={styles.subtitle}>
          One core, many apps. Pick one to launch.
        </C.Text>

        {shapes.map(function (shape) {
          // Render one navigable card per shape
          return (
            <Link key={shape.key} href={shape.route} asChild>
              <Pressable style={styles.cardWrap}>
                <C.Card style={styles.card}>
                  <C.View background="app_primary_subtle" radius="md" style={styles.iconWrap}>
                    <C.Icon name={shape.icon} size="xxl" color="APP_PRIMARY" />
                  </C.View>
                  <C.View style={styles.cardText}>
                    <C.Text size="lg" weight="semibold">{shape.label}</C.Text>
                    <C.Text color="text_secondary">{shape.tagline}</C.Text>
                  </C.View>
                  <C.Icon name="chevron-forward" size="lg" color="TEXT_MUTED" />
                </C.Card>
              </Pressable>
            </Link>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  content: { padding: 24, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  subtitle: { marginBottom: 12 },
  cardWrap: { width: '100%' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 }
});
