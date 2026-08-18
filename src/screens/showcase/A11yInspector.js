// Info: A11y inspector. Renders a selected Carbon component live and inspects
// the accessibility props it emits to the host tree (aria-* and accessibility*
// keys) using react-test-renderer. The selectable set is filtered against the
// live registry, so a component that ships in the package but is not listed
// below is simply not offered - the roster source is still Object.keys.
import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import TestRenderer from 'react-test-renderer';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
import SafeSample from './SafeSample';


// Curated selectable set (must include Checkbox, Tabs, Slider). Each entry
// builds the element to inspect from the live registry so the props match the
// shipped component.
const SELECTABLE = ['Checkbox', 'Tabs', 'Slider', 'RadioButton', 'Toggle', 'Link', 'ListItem', 'Button'];


// Build the element to mount for a given component name from the live registry.
function buildElement (name, Component) {

  const C = Component;

  switch (name) {

  case 'Checkbox':
    return <C.Checkbox checked onChange={function () {}} label="Inspect me" />;

  case 'Slider':
    return <C.Slider value={0.5} onValueChange={function () {}} label="Volume" />;

  case 'Tabs':
    return (
      <C.Tabs selectedIndex={0} onChange={function () {}}>
        <C.Tab>One</C.Tab>
        <C.Tab>Two</C.Tab>
      </C.Tabs>
    );

  case 'RadioButton':
    return <C.RadioButton checked onChange={function () {}} label="Pick me" />;

  case 'Toggle':
    return <C.Toggle value onValueChange={function () {}} label="Toggle" />;

  case 'Link':
    return <C.Link onPress={function () {}}>Inspect link</C.Link>;

  case 'ListItem':
    return <C.ListItem title="Inspect item" onPress={function () {}} />;

  case 'Button':
    return <C.Button title="Inspect" onPress={function () {}} />;

  default:
    return null;

  }

}


// Walk a test-renderer tree and collect every accessibility-related prop the
// component emits. Returns a deduped map of prop name -> example value.
function collectA11y (root) {

  const found = {};

  const visit = function (node) {

    if (!node) {
      return;
    }

    const props = node.props || {};
    const keys = Object.keys(props);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.indexOf('aria') === 0 || k.indexOf('accessibility') === 0) {
        found[k] = props[k];
      }
    }

    const children = node.children || [];
    for (let j = 0; j < children.length; j++) {
      visit(children[j]);
    }

  };

  visit(root);
  return found;

}


export default function A11yInspector () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  const [selected, setSelected] = useState('Checkbox');

  // Only offer components that actually exist in the live registry
  const options = useMemo(function () {
    if (!reg) {
      return [];
    }
    return SELECTABLE.filter(function (k) {
      return Boolean(reg.Component[k]);
    });
  }, [reg]);

  // Inspect the selected component's emitted a11y props via react-test-renderer
  const a11y = useMemo(function () {

    if (!reg || !reg.Component[selected]) {
      return {};
    }

    const el = buildElement(selected, reg.Component);
    if (!el) {
      return {};
    }

    let tree;
    try {
      tree = TestRenderer.create(el);
    } catch (err) {
      return { error: String(err && err.message ? err.message : err) };
    }

    const found = collectA11y(tree.root);
    TestRenderer.unmount(tree);
    return found;

  }, [reg, selected]);

  if (!reg) {
    return null;
  }

  const a11yKeys = Object.keys(a11y).filter(function (k) {
    return k !== 'error';
  });

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">A11y Inspector</C.Text>
      <C.Text color="text_secondary">Pick a component - its emitted aria-* / accessibility* props are listed below.</C.Text>

      <View style={styles.chips}>
        {options.map(function (k) {
          const active = k === selected;
          return (
            <Pressable
              key={k}
              onPress={function () {
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
        {a11yKeys.length === 0 && !a11y.error ? (
          <C.Text size="xs" color="text_muted">No aria-* or accessibility* props emitted.</C.Text>
        ) : null}
        {a11yKeys.map(function (k) {
          const val = a11y[k];
          const display = val === true ? 'true' : (val === false ? 'false' : String(val));
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
