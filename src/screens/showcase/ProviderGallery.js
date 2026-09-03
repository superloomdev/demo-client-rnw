// Info: Provider gallery. The Carbon package ships context-only providers at
// Component.provider (no tokens, no visual output). This screen iterates the
// live provider keys and renders each in a full-width row with a functional
// demonstration of what the provider does, not just "wrapped by X".
import React, { useMemo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';
import { ShowcaseRow, StateCell } from './ShowcaseRow.js';
import GalleryList from './GalleryList.js';
import SafeSample from './SafeSample.js';


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

  // Build the row descriptor array: Layer first (custom demo), then the rest
  const rows = useMemo(function () {

    const out = [];
    if (Layer) {
      out.push({ key: 'Layer', kind: 'custom' });
    }

    for (let i = 0; i < names.length; i++) {
      if (names[i] === 'Layer') {
        continue;
      }
      out.push({ key: names[i], kind: 'generic' });
    }

    return out;

  }, [Layer, names]);

  // Render one row from its descriptor, memoized so scrolling does not rebuild
  // every row closure
  const renderRow = useCallback(function (item) {

    if (item.kind === 'custom') {
      // Layer gets a custom demo with nested levels
      return (
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
      );
    }

    // Generic provider row
    const Provider = providers[item.key];
    const info = PROVIDER_INFO[item.key] || {};
    return (
      <ShowcaseRow name={item.key} C={C}>
        <StateCell label="wrapping" C={C}>
          <SafeSample name={item.key}>
            <Provider>
              <View style={styles.providerDemo}>
                <C.Text size="xs" color="text_muted">{info.blurb || 'Context provider'}</C.Text>
                <C.Text size="sm">Content inside {item.key}</C.Text>
              </View>
            </Provider>
          </SafeSample>
        </StateCell>
      </ShowcaseRow>
    );

  }, [C, Layer, providers]);

  // Header: gallery title and description
  const header = (
    <React.Fragment>
      <C.Text size="lg" weight="semibold">Providers ({names.length})</C.Text>
      <C.Text color="text_secondary">Context-only components. Each wraps its children with a specific capability.</C.Text>
    </React.Fragment>
  );

  // Footer: back link
  const footer = (
    <Link href="/showcase" asChild>
      <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
    </Link>
  );

  // Render the virtualized gallery
  return (
    <GalleryList
      rows={rows}
      renderRow={renderRow}
      header={header}
      footer={footer}
      testID="provider-gallery-list"
    />
  );

}


const styles = StyleSheet.create({
  layerBox: { padding: 8, minWidth: 80 },
  providerDemo: { gap: 4 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
