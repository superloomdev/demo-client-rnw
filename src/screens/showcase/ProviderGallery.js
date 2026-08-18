// Info: Provider gallery. The Carbon package ships context-only providers at
// Component.provider (no tokens, no visual output). This screen iterates the
// live provider keys and renders each in a full-width row with a functional
// demonstration of what the provider does, not just "wrapped by X".
import React from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
const { ShowcaseRow, StateCell } = require('./ShowcaseRow');
import SafeSample from './SafeSample';


// Description and demonstration config per provider
const PROVIDER_INFO = {
  Layer: {
    blurb: 'Auto-incrementing elevation level on nesting (0-2)',
    custom: true
  },
  Overlay: {
    blurb: 'Overlay stack and zIndex ordering (replaces Portal)'
  },
  LiveRegionProvider: {
    blurb: 'Screen-reader announcements that work on web'
  },
  Theme: {
    blurb: 'Scoped theme override context'
  },
  FeatureFlags: {
    blurb: 'Gated feature flags for descendants'
  },
  IdPrefix: {
    blurb: 'Namespaced id prefix for a11y uniqueness'
  },
  FluidForm: {
    blurb: 'Fluid form state shared across fields'
  },
  ErrorBoundary: {
    blurb: 'Boundary context for error isolation'
  }
};


export default function ProviderGallery () {

  // Resolve the live lib, navigation helpers, themed components, and showcase registry
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  // Wait for the registry before rendering anything
  if (!reg) {
    // Render nothing while the registry is loading
    return null;
  }

  // Extract the provider map, its keys, and the Layer provider for a custom demo
  const providers = reg.Component.provider || {};
  const names = Object.keys(providers);
  const Layer = providers.Layer;

  // Render the provider gallery with a custom Layer demo and generic provider rows
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Providers ({names.length})</C.Text>
      <C.Text color="text_secondary">Context-only components. Each wraps its children with a specific capability.</C.Text>

      {/* Layer gets a custom demo with nested levels */}
      {Layer ? (
        <ShowcaseRow name="Layer" C={C}>
          <StateCell label="level 0" C={C}>
            <SafeSample name="Layer-0">
              <Layer>
                <C.View border style={styles.layerBox}>
                  <C.Text size="xs">Level 0</C.Text>
                </C.View>
              </Layer>
            </SafeSample>
          </StateCell>
          <StateCell label="level 1" C={C}>
            <SafeSample name="Layer-1">
              <Layer>
                <Layer>
                  <C.View border style={styles.layerBox}>
                    <C.Text size="xs">Level 1</C.Text>
                  </C.View>
                </Layer>
              </Layer>
            </SafeSample>
          </StateCell>
          <StateCell label="level 2" C={C}>
            <SafeSample name="Layer-2">
              <Layer>
                <Layer>
                  <Layer>
                    <C.View border style={styles.layerBox}>
                      <C.Text size="xs">Level 2</C.Text>
                    </C.View>
                  </Layer>
                </Layer>
              </Layer>
            </SafeSample>
          </StateCell>
        </ShowcaseRow>
      ) : null}

      {/* All other providers */}
      {names.map(function (k) {
        // Skip Layer since it has a custom demo above
        if (k === 'Layer') {
          // Skip the Layer provider in the generic loop
          return null;
        }
        const Provider = providers[k];
        const info = PROVIDER_INFO[k] || {};
        // Render one showcase row per provider with a wrapping demo
        return (
          <ShowcaseRow key={k} name={k} C={C}>
            <StateCell label="wrapping" C={C}>
              <SafeSample name={k}>
                <Provider>
                  <View style={styles.providerDemo}>
                    <C.Text size="xs" color="text_muted">{info.blurb || 'Context provider'}</C.Text>
                    <C.Text size="sm">Content inside {k}</C.Text>
                  </View>
                </Provider>
              </SafeSample>
            </StateCell>
          </ShowcaseRow>
        );
      })}

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' },
  layerBox: { padding: 8, minWidth: 80 },
  providerDemo: { gap: 4 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
