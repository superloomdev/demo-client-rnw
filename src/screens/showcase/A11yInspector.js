// Info: A11y inspector. Renders a selected Carbon component live and inspects
// the accessibility props it emits to the host tree (aria-* and accessibility*
// keys) using react-test-renderer. The selectable set is filtered against the
// live registry, so a component that ships in the package but is not listed
// below is simply not offered - the roster source is still Object.keys.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';
import SafeSample from './SafeSample.js';


// Curated selectable set (must include Checkbox, Tabs, Slider). Each entry
// builds the element to inspect from the live registry so the props match the
// shipped component.
const SELECTABLE = ['Checkbox', 'Tabs', 'Slider', 'RadioButton', 'Toggle', 'Link', 'ListItem', 'Button'];


// Build the element to mount for a given component name from the live registry.
function buildElement (name, Component) {

  // Alias the component registry for shorter case branches
  const C = Component;

  // Build the element to mount based on the component name
  switch (name) {

  case 'Checkbox':
    // Render a checked checkbox for a11y inspection
    return <C.Checkbox checked onChange={function () {}} label="Inspect me" />;

  case 'Slider':
    // Render a slider at 50% for a11y inspection
    return <C.Slider value={0.5} onValueChange={function () {}} label="Volume" />;

  case 'Tabs':
    // Render a two-tab container for a11y inspection
    return (
      <C.Tabs selectedIndex={0} onChange={function () {}}>
        <C.Tab>One</C.Tab>
        <C.Tab>Two</C.Tab>
      </C.Tabs>
    );

  case 'RadioButton':
    // Render a checked radio button for a11y inspection
    return <C.RadioButton checked onChange={function () {}} label="Pick me" />;

  case 'Toggle':
    // Render an on toggle for a11y inspection
    return <C.Toggle value onValueChange={function () {}} label="Toggle" />;

  case 'Link':
    // Render a link for a11y inspection
    return <C.Link onPress={function () {}}>Inspect link</C.Link>;

  case 'ListItem':
    // Render a list item for a11y inspection
    return <C.ListItem title="Inspect item" onPress={function () {}} />;

  case 'Button':
    // Render a button for a11y inspection
    return <C.Button title="Inspect" onPress={function () {}} />;

  default:
    // Return null for unmapped component names
    return null;

  }

}


// Walk a test-renderer tree and collect every accessibility-related prop the
// component emits. Returns a deduped map of prop name -> example value.
function collectA11y (root) {

  // Accumulate accessibility props found during tree traversal
  const found = {};

  // Recursively visit each node, collecting a11y props from props and children
  const visit = function (node) {

    // Skip null or undefined nodes to avoid crashes
    if (!node) {
      // Bail out of the recursion for empty nodes
      return;
    }

    // Extract the node's props and their keys for scanning
    const props = node.props || {};
    const keys = Object.keys(props);

    // Scan every prop key for aria-* or accessibility-* prefixes
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.indexOf('aria') === 0 || k.indexOf('accessibility') === 0) {
        found[k] = props[k];
      }
    }

    // Recurse into child nodes to collect nested a11y props
    const children = node.children || [];
    for (let j = 0; j < children.length; j++) {
      visit(children[j]);
    }

  };

  // Walk the tree and return the collected a11y props
  visit(root);
  // Return the deduped map of accessibility prop name to example value
  return found;

}


export default function A11yInspector () {

  // Resolve the live lib, navigation helpers, themed components, and showcase registry
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  // Track which component the user has selected for inspection
  const [selected, setSelected] = useState('Checkbox');

  // Only offer components that actually exist in the live registry
  const options = useMemo(function () {
    // Return an empty list while the registry is still loading
    if (!reg) {
      return [];
    }
    // Filter the curated set down to components present in the live registry
    return SELECTABLE.filter(function (k) {
      // Keep only names that exist as actual components
      return Boolean(reg.Component[k]);
    });
  }, [reg]);

  // Inspect the selected component's emitted a11y props via react-test-renderer
  const a11y = useMemo(function () {

    // Return empty if the registry or selected component is unavailable
    if (!reg || !reg.Component[selected]) {
      return {};
    }

    // Build the element to inspect; return empty if the name is unmapped
    const el = buildElement(selected, reg.Component);
    if (!el) {
      return {};
    }

    // Mount the element with test-renderer, capturing any render error
    let tree;
    try {
      tree = TestRenderer.create(el);
    } catch (err) {
      // Return the error message so the UI can display it
      return { error: String(err && err.message ? err.message : err) };
    }

    // Collect a11y props from the mounted tree, then clean up
    const found = collectA11y(tree.root);
    TestRenderer.unmount(tree);
    // Return the collected accessibility props map
    return found;

  }, [reg, selected]);

  // Wait for the registry before rendering anything
  if (!reg) {
    // Render nothing while the registry is loading
    return null;
  }

  // Extract a11y prop keys, excluding the error key if present
  const a11yKeys = Object.keys(a11y).filter(function (k) {
    // Keep only non-error keys for the props list
    return k !== 'error';
  });

  // Render the inspector UI with chips, live render, and props list
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">A11y Inspector</C.Text>
      <C.Text color="text_secondary">Pick a component - its emitted aria-* / accessibility* props are listed below.</C.Text>

      <View style={styles.chips}>
        {options.map(function (k) {
          // Determine if this chip is the currently selected component
          const active = k === selected;
          // Render one selectable chip per available component
          return (
            <Pressable
              key={k}
              onPress={function () {
                // Select this component for inspection
                setSelected(k);
              }}
              style={[styles.chip, active ? styles.chipActive : null]}
            >
              <C.Text size="sm" color={active ? 'text_on_primary' : 'text_primary'}>{k}</C.Text>
            </Pressable>
          );
        })}
      </View>

      <C.Card style={styles.stage}>
        <C.Text size="xs" color="text_muted">Live render</C.Text>
        <SafeSample name={selected}>
          {buildElement(selected, reg.Component)}
        </SafeSample>
      </C.Card>

      <C.Card style={styles.props}>
        <C.Text size="sm" weight="semibold">Emitted accessibility props ({a11yKeys.length})</C.Text>
        {a11y.error ? <C.Text size="xs" color="STATUS_DANGER">{a11y.error}</C.Text> : null}
        {Lib.Utils.isEmptyArray(a11yKeys) && !a11y.error ? (
          <C.Text size="xs" color="text_muted">No aria-* or accessibility* props emitted.</C.Text>
        ) : null}
        {a11yKeys.map(function (k) {
          // Resolve the prop value and format it for display
          const val = a11y[k];
          const display = val === true ? 'true' : (val === false ? 'false' : String(val));
          // Render one row per accessibility prop with its name and value
          return (
            <View key={k} style={styles.propRow}>
              <C.Text size="xs" weight="semibold" style={styles.propKey}>{k}</C.Text>
              <C.Text size="xs" color="text_secondary">{display}</C.Text>
            </View>
          );
        })}
      </C.Card>

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  stage: { gap: 8 },
  props: { gap: 6 },
  propRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 2 },
  propKey: { flexShrink: 1 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
