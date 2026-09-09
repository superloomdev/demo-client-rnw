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
        <C.View background="layer_02" radius="radius_08" border={true} style={styles.card}>
          <C.View background="layer_accent_01" radius="radius_04" style={styles.iconWrap}>
            <C.Icon name={icon} size="xxl" color="interactive" />
          </C.View>
          <C.View style={styles.cardText}>
            <C.Text typeSet="heading02" weight="semibold">{label} ({count})</C.Text>
            <C.Text color="text_secondary">{blurb}</C.Text>
          </C.View>
          <C.Icon name="chevron-forward" size="lg" color="text_secondary" />
        </C.View>
      </Pressable>
    </Link>
  );

}


// The schemes and brands the selector offers, in display order. Schemes are
// Carbon base token sets; brands are accent overlays. Each names a string
// passed to ctl.updateScheme or ctl.updateBrand.
const SELECTABLE_SCHEMES = [
  { key: 'white', label: 'White', blurb: 'Carbon White theme, light background', type: 'scheme' },
  { key: 'g10', label: 'Gray 10', blurb: 'Carbon g10, subtle gray background', type: 'scheme' },
  { key: 'g90', label: 'Gray 90', blurb: 'Carbon g90, dark background', type: 'scheme' },
  { key: 'g100', label: 'Gray 100', blurb: 'Carbon g100, deep dark background', type: 'scheme' },
  { key: 'tasks', label: 'Tasks', blurb: 'Indigo accent, rounded corners', type: 'brand' },
  { key: 'notes', label: 'Notes', blurb: 'Teal accent, larger type ratio', type: 'brand' }
];


// Scheme selector - swaps the whole base token set at runtime. A scheme is a
// complete token set, so this calls updateScheme (replace) rather than
// updateTheme (partial overlay). The accent swatch renders color.interactive from
// the live theme, so it is the visible proof the swap reached the tokens.
function SchemeSelector ({ C }) {

  // Resolve the theme controller and the lib for scheme access
  const Lib = useLib();
  const ctl = Lib.ThemeContext.useThemeController();
  const theme = Lib.ThemeContext.useTheme();
  const [selected, setSelected] = React.useState(SELECTABLE_SCHEMES[0].key);

  // Replace the base scheme or brand and record which button is active
  const switchTo = function (key) {
    const item = SELECTABLE_SCHEMES.find(function (s) {
      return s.key === key;
    });
    setSelected(key);
    if (item && item.type === 'scheme' && ctl && ctl.updateScheme) {
      ctl.updateScheme(key);
    } else if (item && item.type === 'brand' && ctl && ctl.updateBrand) {
      ctl.updateBrand(key);
    }
  };

  // Render one toggle per scheme plus a swatch showing the live accent.
  // Colors and radii come from the theme, never from literals, so the
  // selector re-skins itself along with everything else on the page.
  return (
    <C.View background="layer_02" radius="radius_08" border={true} style={styles.schemeCard}>
      <C.Text typeSet="caption02" color="text_secondary">Scheme</C.Text>
      <C.View style={styles.schemeRow}>
        {SELECTABLE_SCHEMES.map(function (scheme) {

          // Hoist the active flag so it is read once, not per-JSX-child
          const active = selected === scheme.key;

          // Move the visual properties onto the Pressable itself so the hit
          // target is the visible element, not a wrapper that RNW can detach
          // from under the pointer on hover re-render
          return (
            <Pressable
              key={scheme.key}
              testID={'scheme-option-' + scheme.key}
              onPress={function () {
                switchTo(scheme.key);
              }}
              style={[
                styles.schemeBtn,
                {
                  backgroundColor: active ? theme['color.layer_accent_01'] : 'transparent',
                  borderRadius: theme['shape.radius_04']
                }
              ]}
            >
              <C.Text typeSet="caption02" weight={active ? 'bold' : 'regular'}>
                {scheme.label}
              </C.Text>
            </Pressable>
          );
        })}
      </C.View>
      <C.View style={styles.swatchRow}>
        <C.View
          testID="scheme-accent-swatch"
          background="interactive"
          radius="radius_02"
          style={styles.swatch}
        />
        <C.Text typeSet="caption01" color="text_secondary">
          {SELECTABLE_SCHEMES.find(function (s) {
            return s.key === selected;
          }).blurb}
        </C.Text>
      </C.View>
    </C.View>
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

      <C.Text typeSet="heading04" weight="bold">Carbon Components</C.Text>
      <C.Text color="text_secondary">Every component from @superloomdev/rnw-components, live.</C.Text>

      <C.View background="layer_02" radius="radius_08" border={true} style={styles.summary}>
        <C.Text typeSet="caption02" color="text_secondary">Live registry total</C.Text>
        <C.Text typeSet="heading03" weight="bold">{counts.total} components</C.Text>
        <C.Text typeSet="caption01" color="text_secondary">
          {counts.atoms} atoms · {counts.molecules} molecules · {counts.composites} composites · {counts.providers} providers
        </C.Text>
        {counts.uncategorized > 0 ? (
          <C.Text typeSet="caption01" color="text_secondary">+ {counts.uncategorized} uncategorized (new since tier map)</C.Text>
        ) : null}
      </C.View>

      <SchemeSelector C={C} />

      <IndexCard C={C} label="Atoms" count={counts.atoms} blurb="One element, one concern" href="/showcase/atoms" icon="cube-outline" />
      <IndexCard C={C} label="Molecules" count={counts.molecules} blurb="Atoms composed" href="/showcase/molecules" icon="build-outline" />
      <IndexCard C={C} label="Composites" count={counts.composites} blurb="Multi-part, coordinated" href="/showcase/composites" icon="grid-outline" />
      <IndexCard C={C} label="Providers" count={counts.providers} blurb="Context-only, no UI" href="/showcase/providers" icon="layers-outline" />
      <IndexCard C={C} label="A11y Inspector" count={null} blurb="aria-* props each component emits" href="/showcase/a11y" icon="accessibility-outline" />
      <IndexCard C={C} label="Carbon Parity" count={null} blurb="Roster + platform capability" href="/showcase/parity" icon="checkmark-done-outline" />

      <Link href="/" asChild>
        <Pressable style={styles.home}><C.Text color="interactive" weight="medium">Back to launcher</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  summary: { gap: 2, padding: 16 },
  cardWrap: {},
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  iconWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  home: { alignItems: 'center', paddingVertical: 12 },
  schemeCard: { gap: 8, padding: 16 },
  schemeRow: { flexDirection: 'row', gap: 8 },
  schemeBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 20, height: 20 }
});
