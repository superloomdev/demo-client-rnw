// Info: Shared layout components for the showcase galleries. Every component
// across all tiers (atoms, molecules, composites, providers) renders in a
// full-width row with labelled state cells showing multiple visual states.
//
// ShowcaseRow - full-width bordered row with a name label and flex-wrap states
// StateCell   - one labelled state cell within a row
//
// All text uses C.Text from the component library so typography follows the
// active theme (Poppins via tasks-scheme). No hardcoded font sizes or colors.
import React from 'react';
import { View, StyleSheet } from 'react-native';

import SafeSample from './SafeSample.js';


// One labelled state cell within a showcase row.
//
// stageWidth is an opt-in minimum width for the stage. The default 100 crushes
// a container component down to the width of its own label text, which reads
// as a broken box rather than a list. A component that needs room to look like
// itself declares a width instead of every row paying for the widest case.
function StateCell ({ label, children, C, stageWidth }) {
  // Render the label above an error-isolated stage for the child content
  return (
    <View style={[cellStyles.cell, stageWidth ? { minWidth: stageWidth } : null]}>
      <C.Text size="xs" color="text_muted" style={cellStyles.labelStyle}>{label}</C.Text>
      <View style={[cellStyles.stage, stageWidth ? { width: '100%' } : null]}>
        <SafeSample name={label}>{children}</SafeSample>
      </View>
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: { gap: 4, alignItems: 'flex-start', minWidth: 100 },
  labelStyle: { textTransform: 'uppercase', letterSpacing: 0.5 },
  stage: { minHeight: 20 }
});


// Full-width row for one component with multiple state cells
function ShowcaseRow ({ name, children, C }) {
  // Render the component name label above a flex-wrap container of state cells.
  // The testID lets per-row screenshots and virtualization tests address a
  // single component out of the full roster.
  return (
    <View testID={'showcase-row-' + name} style={rowStyles.row}>
      <C.Text size="sm" weight="semibold">{name}</C.Text>
      <View style={rowStyles.states}>{children}</View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    gap: 10
  },
  states: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }
});


export { ShowcaseRow, StateCell };
