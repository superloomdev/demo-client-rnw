// Info: Carbon parity screen. Lists the live roster (Object.keys(Component))
// with each component's platform capability and highlights the platform you are
// currently viewing on (Platform.OS). The roster is registry-driven; the
// per-component capability comes from the source-derived platforms metadata,
// defaulting to "both" for anything unmapped.
import React, { useMemo } from 'react';
import { ScrollView, View, Pressable, Platform, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
const platforms = require('./platforms');


// Map Platform.OS ("web" | "ios" | "android") to the badge key used by SUPPORT.
function currentPlatformKey () {
  const os = Platform.OS;
  if (os === 'web') {
    return 'web';
  }
  return os; // "ios" | "android"
}


// One platform badge. Tone reflects support level + whether it is current.
function PlatformBadge ({ C, label, level, current }) {

  const bg = level === 'full' ? '#E8F5E9' : (level === 'partial' ? '#FCF4D6' : '#FFF1F1');
  const fg = level === 'full' ? '#198038' : (level === 'partial' ? '#B45309' : '#DA1E28');

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: current ? '#4F46E5' : 'transparent' }]}>
      <C.Text size="xs" style={{ color: fg }}>{label}{current ? ' · you' : ''}</C.Text>
    </View>
  );

}


export default function CarbonParity () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  const current = currentPlatformKey();

  // Build the parity rows from the live registry, sorted alphabetically.
  const rows = useMemo(function () {

    if (!reg) {
      return [];
    }

    const flat = Object.keys(reg.Component).filter(function (k) {
      return ['variant', 'freeform', 'provider'].indexOf(k) === -1;
    });

    return flat.sort().map(function (k) {
      const cap = platforms.capability(k);
      return { name: k, capability: cap, support: platforms.SUPPORT[cap] || platforms.SUPPORT.both };
    });

  }, [reg]);

  if (!reg) {
    return null;
  }

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
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 2 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
