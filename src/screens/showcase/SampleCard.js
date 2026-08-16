// Info: One registry component rendered in a labelled, error-isolated card.
// The name is always shown; the component itself is mounted inside SafeSample
// with minimal props so a component that needs specific props/children to
// render degrades to a neutral fallback instead of crashing the gallery.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SafeSample from './SafeSample';

// Render-hint props sourced from the package. One source, two consumers
// (tests and showcase). See _test/harness/props.js in the components package.
const HINT_PROPS = require('@superloomdev/rnw-components-carbon/data/hint-props');


export default function SampleCard ({ name, Component }) {

  const Comp = Component[name];
  const hint = HINT_PROPS[name] || null;

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{name}</Text>
      <View style={styles.stage}>
        <SafeSample name={name}>
          {Comp ? <Comp {...hint} /> : <Text style={styles.missing}>not in registry</Text>}
        </SafeSample>
      </View>
    </View>
  );

}


const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#525252', textTransform: 'none' },
  stage: { minHeight: 24 },
  missing: { fontSize: 12, color: '#8d8d8d' }
});
