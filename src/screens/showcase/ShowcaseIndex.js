// Info: Showcase index - the landing screen for the Carbon Components shape.
// Lists one section per tier with a live count pulled from the built registry
// (Object.keys(Component)), and a link into each gallery. Counts are never
// hardcoded: they reflect the package as shipped, so a roster change in the
// library shows up here with no showcase edit.
import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';


// One link card in the index. label + live count + route.
function IndexCard ({ C, label, count, blurb, href, icon }) {

  // Resolve the navigation Link component for routing
  const { Link } = useLib().Navigation;

  // Render one navigable card with icon, label, count, and blurb
  return (
    <Link href={href} asChild>
      <Pressable style={styles.cardWrap}>
        <C.Card style={styles.card}>
          <C.View background="app_primary_subtle" radius="md" style={styles.iconWrap}>
            <C.Icon name={icon} size="xxl" color="APP_PRIMARY" />
          </C.View>
          <C.View style={styles.cardText}>
            <C.Text size="lg" weight="semibold">{label} ({count})</C.Text>
            <C.Text color="text_secondary">{blurb}</C.Text>
          </C.View>
          <C.Icon name="chevron-forward" size="lg" color="TEXT_MUTED" />
        </C.Card>
      </Pressable>
    </Link>
  );

}


// Scheme selector - switches the showcase between neutral and Carbon themes.
// The Carbon scheme is spec-faithful: square corners, Carbon Blue 60, IBM Plex Sans.
function SchemeSelector ({ C }) {

  // Resolve the theme controller and the lib for scheme access
  const Lib = useLib();
  const ctl = Lib.ThemeContext.useThemeController();
  const [selected, setSelected] = React.useState('tasks');

  // Switch the scheme via the controller's updateScheme method
  const switchTo = function (name) {
    setSelected(name);
    if (ctl && ctl.updateScheme && Lib.Schemes[name]) {
      ctl.updateScheme(Lib.Schemes[name]);
    }
  };

  // Render a two-button toggle: Tasks (indigo, rounded) vs Carbon (blue, square)
  return (
    <C.Card style={{ gap: 8 }}>
      <C.Text size="sm" color="text_muted">Scheme</C.Text>
      <C.View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={function () {
            switchTo('tasks');
          }}
          style={[
            styles.schemeBtn,
            selected === 'tasks' ? styles.schemeBtnActive : null
          ]}
        >
          <C.Text size="sm" weight={selected === 'tasks' ? 'bold' : 'regular'}>Tasks</C.Text>
        </Pressable>
        <Pressable
          onPress={function () {
            switchTo('carbon');
          }}
          style={[
            styles.schemeBtn,
            selected === 'carbon' ? styles.schemeBtnActive : null
          ]}
        >
          <C.Text size="sm" weight={selected === 'carbon' ? 'bold' : 'regular'}>Carbon</C.Text>
        </Pressable>
      </C.View>
    </C.Card>
  );

}


export default function ShowcaseIndex () {

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

  // Pull live component counts from the built registry
  const counts = reg.counts;

  // Render the showcase index with summary card and one link card per gallery
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="xxl" weight="bold">Carbon Components</C.Text>
      <C.Text color="text_secondary">Every component from @superloomdev/rnw-components-carbon, live.</C.Text>

      <C.Card style={styles.summary}>
        <C.Text size="sm" color="text_muted">Live registry total</C.Text>
        <C.Text size="xl" weight="bold">{counts.total} components</C.Text>
        <C.Text size="xs" color="text_secondary">
          {counts.atoms} atoms · {counts.molecules} molecules · {counts.composites} composites · {counts.providers} providers
        </C.Text>
        {counts.uncategorized > 0 ? (
          <C.Text size="xs" color="text_muted">+ {counts.uncategorized} uncategorized (new since tier map)</C.Text>
        ) : null}
      </C.Card>

      <SchemeSelector C={C} />

      <IndexCard C={C} label="Atoms" count={counts.atoms} blurb="One element, one concern" href="/showcase/atoms" icon="cube-outline" />
      <IndexCard C={C} label="Molecules" count={counts.molecules} blurb="Atoms composed" href="/showcase/molecules" icon="build-outline" />
      <IndexCard C={C} label="Composites" count={counts.composites} blurb="Multi-part, coordinated" href="/showcase/composites" icon="grid-outline" />
      <IndexCard C={C} label="Providers" count={counts.providers} blurb="Context-only, no UI" href="/showcase/providers" icon="layers-outline" />
      <IndexCard C={C} label="A11y Inspector" count={null} blurb="aria-* props each component emits" href="/showcase/a11y" icon="accessibility-outline" />
      <IndexCard C={C} label="Carbon Parity" count={null} blurb="Roster + platform capability" href="/showcase/parity" icon="checkmark-done-outline" />

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="app_primary" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  summary: { gap: 2 },
  cardWrap: {},
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  home: { alignItems: 'center', paddingVertical: 12 },
  schemeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  schemeBtnActive: { backgroundColor: '#edf5ff', borderColor: '#0f62fe' }
});
