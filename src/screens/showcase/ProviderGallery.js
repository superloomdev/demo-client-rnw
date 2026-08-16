// Info: Provider gallery. The Carbon package ships context-only providers at
// Component.provider (no tokens, no visual output). This screen iterates the
// live provider keys and renders each wrapping a visible label, with the
// Layer provider nested three deep to demonstrate its elevation cascade.
import React from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
import SafeSample from './SafeSample';


// Short, human-readable note for each provider. Keys come from the live
// registry; this map only supplies a description and is never used to decide
// WHAT renders — Object.keys(Component.provider) does.
const BLURB = {
  Overlay: 'Overlay stack + zIndex ordering (replaces Portal)',
  LiveRegionProvider: 'Screen-reader announcements that work on web',
  Layer: 'Auto-incrementing elevation level on nesting (0–2)',
  Theme: 'Scoped theme override context',
  FeatureFlags: 'Gated feature flags for descendants',
  IdPrefix: 'Namespaced id prefix for a11y uniqueness',
  FluidForm: 'Fluid form state shared across fields',
  ErrorBoundary: 'Boundary context for error isolation'
};


export default function ProviderGallery () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  if (!reg) {
    return null;
  }

  const providers = reg.Component.provider || {};
  const names = Object.keys(providers);
  const Layer = providers.Layer;

  // Layer nested three deep — each level auto-increments the elevation context.
  function LayerNest () {
    if (!Layer) {
      return <C.Text color="text_muted">Layer provider not present</C.Text>;
    }
    return (
      <SafeSample name="Layer (×3 nested)">
        <Layer>
          <Layer>
            <Layer>
              <C.Text size="sm">Content nested 3 Layer levels deep</C.Text>
            </Layer>
          </Layer>
        </Layer>
      </SafeSample>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Providers ({names.length})</C.Text>
      <C.Text color="text_secondary">Context-only — no tokens, no visual output. Each wraps its children.</C.Text>

      <LayerNest />

      <View style={styles.grid}>
        {names.map(function (k) {
          const Provider = providers[k];
          return (
            <View key={k} style={styles.card}>
              <C.Text size="md" weight="semibold">{k}</C.Text>
              <C.Text size="xs" color="text_secondary">{BLURB[k] || 'Context provider'}</C.Text>
              <SafeSample name={k}>
                <Provider>
                  <C.Text size="xs" color="text_muted">wrapped by {k}</C.Text>
                </Provider>
              </SafeSample>
            </View>
          );
        })}
      </View>

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, gap: 6, minWidth: 220, flex: 1 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
