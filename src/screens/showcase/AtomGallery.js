// Info: Atom gallery. Iterates the live registry's atom bucket (derived from
// Object.keys(Component) via the tier metadata) and renders every atom in a
// labelled, error-isolated card. The roster is registry-driven — add a new
// atom to the package and it appears here with no showcase change.
import React from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
import SampleCard from './SampleCard';


export default function AtomGallery () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  if (!reg) {
    return null;
  }

  const Component = reg.Component;
  const keys = reg.buckets.atom;

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Atoms ({keys.length})</C.Text>
      <C.Text color="text_secondary">The smallest building blocks — one element, one concern.</C.Text>

      <View style={styles.grid}>
        {keys.map(function (k) {
          return <SampleCard key={k} name={k} Component={Component} />;
        })}
      </View>

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  back: { alignItems: 'center', paddingVertical: 12 }
});
