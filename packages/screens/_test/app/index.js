// Screens test index — links to every individual screen test page
import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGES = [
  { label: 'Main — Launcher',   href: '/main-launcher' },
  { label: 'Tasks — List',      href: '/tasks-list' },
  { label: 'Notes — List',      href: '/notes-list' },
];

export default function Index () {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.list}>
        <Text style={s.title}>Nimbus Screens</Text>
        {PAGES.map(function (p) {
          return (
            <Link key={p.href} href={p.href} asChild>
              <Pressable style={s.row}>
                <Text style={s.label}>{p.label}</Text>
                <Text style={s.arrow}>›</Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  list: { padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 16 },
  arrow: { fontSize: 20, color: '#9CA3AF' },
});
