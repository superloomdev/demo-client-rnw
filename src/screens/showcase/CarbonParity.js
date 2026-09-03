// Info: Carbon parity screen. Lists the live roster (Object.keys(Component))
// with each component's platform capability and highlights the platform you are
// currently viewing on (Platform.OS). The roster is registry-driven; the
// per-component capability comes from the source-derived platforms metadata,
// defaulting to "both" for anything unmapped.
import React, { useMemo } from 'react';
import { ScrollView, View, Pressable, Platform, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';
import platforms from './platforms.js';


// Map Platform.OS ("web" | "ios" | "android") to the badge key used by SUPPORT.
function currentPlatformKey () {
  // Read the host platform OS to determine the badge key
  const os = Platform.OS;
  // Map "web" explicitly since the badge key differs from native OS strings
  if (os === 'web') {
    // Return the web badge key
    return 'web';
  }
  return os; // "ios" | "android"
}


// One platform badge. Tone reflects support level + whether it is current.
function PlatformBadge ({ C, label, level, current }) {

  // Resolve the badge color based on the support level
  const colorKey = level === 'full' ? 'status_success' : (level === 'partial' ? 'status_warning' : 'status_danger');

  // Render the platform badge with tone reflecting support level and current platform
  return (
    <View style={[styles.badge, current ? styles.badgeCurrent : null]}>
      <C.View background={colorKey + '_subtle'} radius="sm" style={styles.badgeInner}>
        <C.Text size="xs" color={colorKey}>{label}{current ? ' · you' : ''}</C.Text>
      </C.View>
    </View>
  );

}


export default function CarbonParity () {

  // Resolve the live lib, navigation helpers, themed components, and showcase registry
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  // Determine which platform badge to highlight as current
  const current = currentPlatformKey();

  // Build the parity rows from the live registry, sorted alphabetically.
  const rows = useMemo(function () {

    // Return an empty list while the registry is still loading
    if (!reg) {
      return [];
    }

    // Flatten the registry, excluding meta keys that are not components
    const flat = Object.keys(reg.Component).filter(function (k) {
      // Exclude variant, freeform, and provider meta keys
      return ['variant', 'freeform', 'provider'].indexOf(k) === -1;
    });

    // Build sorted parity rows with per-component capability and support info
    return flat.sort().map(function (k) {
      const cap = platforms.capability(k);
      // Return one row object per component with name, capability, and support
      return { name: k, capability: cap, support: platforms.SUPPORT[cap] || platforms.SUPPORT.both };
    });

  }, [reg]);

  // Wait for the registry before rendering anything
  if (!reg) {
    // Render nothing while the registry is loading
    return null;
  }

  // Render the parity screen with legend and per-component platform badges
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Carbon Parity</C.Text>
      <C.Text color="text_secondary">Roster + platform capability. You are viewing on: <C.Text weight="semibold">{Platform.OS}</C.Text></C.Text>

      <C.Card style={styles.legend}>
        <C.Text size="xs" color="text_muted">{rows.length} components in the live registry</C.Text>
        <View style={styles.legendRow}>
          <PlatformBadge C={C} label="Web" level="full" current={current === 'web'} />
          <PlatformBadge C={C} label="iOS" level="full" current={current === 'ios'} />
          <PlatformBadge C={C} label="Android" level="full" current={current === 'android'} />
        </View>
      </C.Card>

      <View style={styles.table}>
        {rows.map(function (row) {
          // Render one parity row per component with platform support badges
          return (
            <View key={row.name} style={styles.row}>
              <C.Text size="sm" weight="medium" style={styles.rowName}>{row.name}</C.Text>
              <View style={styles.badges}>
                <PlatformBadge C={C} label="Web" level={row.support.web} current={current === 'web'} />
                <PlatformBadge C={C} label="iOS" level={row.support.ios} current={current === 'ios'} />
                <PlatformBadge C={C} label="Android" level={row.support.android} current={current === 'android'} />
              </View>
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
  content: { padding: 16, gap: 12, maxWidth: 720, width: '100%', alignSelf: 'center' },
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', gap: 8 },
  table: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  rowName: { flexShrink: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {},
  badgeCurrent: { borderWidth: 2, borderColor: '#4F46E5', borderRadius: 8 },
  badgeInner: { paddingHorizontal: 8, paddingVertical: 3 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
