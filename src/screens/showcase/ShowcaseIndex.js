// Info: Showcase index - the landing screen for the components showcase.
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
          <C.Icon name="chevron_right" size="lg" color="text_secondary" />
        </C.View>
      </Pressable>
    </Link>
  );

}


// The profiles the selector offers. Each profile is a complete design
// system with its own set of schemes.
const SELECTABLE_PROFILES = [
  { key: 'carbon', label: 'Carbon', blurb: 'Carbon Design v11 reference' },
  { key: 'material', label: 'Material', blurb: 'Material Design 3 reference' }
];

// The schemes available per profile, in display order.
const SCHEMES_BY_PROFILE = {
  carbon: [
    { key: 'white', label: 'White', blurb: 'Carbon White, light background' },
    { key: 'g10', label: 'Gray 10', blurb: 'Carbon g10, subtle gray' },
    { key: 'g90', label: 'Gray 90', blurb: 'Carbon g90, dark' },
    { key: 'g100', label: 'Gray 100', blurb: 'Carbon g100, deep dark' }
  ],
  material: [
    { key: 'light', label: 'Light', blurb: 'Material 3 light' },
    { key: 'dark', label: 'Dark', blurb: 'Material 3 dark' }
  ]
};

// Brand overlays available on any profile.
const SELECTABLE_BRANDS = [
  { key: 'tasks', label: 'Tasks', blurb: 'Indigo accent, rounded corners' },
  { key: 'notes', label: 'Notes', blurb: 'Teal accent, larger type ratio' },
  { key: 'rounded', label: 'Rounded', blurb: 'Carbon-derived, four-sided borders, radius 8' }
];


// Theme selector - swaps the design system profile and scheme at runtime.
// A profile is a complete design system (Carbon, Material). A scheme is a
// complete token set within a profile. A brand is an accent overlay.
// The accent swatch renders color.interactive from the live theme, so it
// is the visible proof the swap reached the tokens.
function ThemeSelector ({ C }) {

  // Resolve the theme controller and the lib for theme access
  const Lib = useLib();
  const ctl = Lib.ThemeContext.useThemeController();
  const theme = Lib.ThemeContext.useTheme();
  // Read the current selection from the controller (single source of truth)
  // so a remount of ThemeSelector does not reset to hardcoded defaults.
  const activeProfile = ctl ? ctl.profileName : SELECTABLE_PROFILES[0].key;
  const activeScheme = ctl ? (ctl.schemeName || (SCHEMES_BY_PROFILE[activeProfile] || SCHEMES_BY_PROFILE[SELECTABLE_PROFILES[0].key])[0].key) : SCHEMES_BY_PROFILE[SELECTABLE_PROFILES[0].key][0].key;
  const activeBrand = ctl ? ctl.brandName : null;

  // Switch the entire profile (design system)
  const switchProfile = function (key) {
    if (ctl && ctl.updateProfile) {
      ctl.updateProfile(key);
    }
  };

  // Switch the scheme within the current profile
  const switchScheme = function (key) {
    if (ctl && ctl.updateScheme) {
      ctl.updateScheme(key);
    }
  };

  // Switch the brand overlay
  const switchBrand = function (key) {
    if (ctl && ctl.updateBrand) {
      ctl.updateBrand(key);
    }
  };

  // Render profile toggles, scheme toggles, brand toggles, and a swatch.
  // Colors and radii come from the theme, never from literals, so the
  // selector re-skins itself along with everything else on the page.
  const currentSchemes = SCHEMES_BY_PROFILE[activeProfile] || [];

  return (
    <C.View background="layer_02" radius="radius_08" border={true} style={styles.schemeCard}>
      <C.Text typeSet="caption02" color="text_secondary">Profile</C.Text>
      <C.View style={styles.schemeRow}>
        {SELECTABLE_PROFILES.map(function (profile) {
          const active = activeProfile === profile.key;
          return (
            <Pressable
              key={profile.key}
              testID={'profile-option-' + profile.key}
              onPress={function () {
                switchProfile(profile.key);
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
                {profile.label}
              </C.Text>
            </Pressable>
          );
        })}
      </C.View>

      <C.Text typeSet="caption02" color="text_secondary">Scheme</C.Text>
      <C.View style={styles.schemeRow}>
        {currentSchemes.map(function (scheme) {
          const active = activeScheme === scheme.key;
          return (
            <Pressable
              key={scheme.key}
              testID={'scheme-option-' + scheme.key}
              onPress={function () {
                switchScheme(scheme.key);
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

      <C.Text typeSet="caption02" color="text_secondary">Brand</C.Text>
      <C.View style={styles.schemeRow}>
        {SELECTABLE_BRANDS.map(function (brand) {
          const active = activeBrand === brand.key;
          return (
            <Pressable
              key={brand.key}
              testID={'brand-option-' + brand.key}
              onPress={function () {
                switchBrand(brand.key);
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
                {brand.label}
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
          {SELECTABLE_PROFILES.find(function (p) {
            return p.key === activeProfile;
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

      <C.Text typeSet="heading04" weight="bold">Components</C.Text>
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

      <ThemeSelector C={C} />

      <IndexCard C={C} label="Atoms" count={counts.atoms} blurb="One element, one concern" href="/showcase/atoms" icon="cube" />
      <IndexCard C={C} label="Molecules" count={counts.molecules} blurb="Atoms composed" href="/showcase/molecules" icon="tools" />
      <IndexCard C={C} label="Composites" count={counts.composites} blurb="Multi-part, coordinated" href="/showcase/composites" icon="grid" />
      <IndexCard C={C} label="Providers" count={counts.providers} blurb="Context-only, no UI" href="/showcase/providers" icon="layers" />
      <IndexCard C={C} label="A11y Inspector" count={null} blurb="aria-* props each component emits" href="/showcase/a11y" icon="accessibility" />
      <IndexCard C={C} label="Parity" count={null} blurb="Roster + platform capability" href="/showcase/parity" icon="task_complete" />

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
