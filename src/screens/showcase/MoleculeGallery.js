// Info: Molecule gallery. Iterates the live registry's molecule bucket (the
// largest tier) as a flat list of labelled, error-isolated cards. The Carbon
// molecule tier spans form, display, and overlay concerns; without per-key
// grouping metadata in the registry we render a flat roster so nothing is
// hidden, and the live count reflects the package as shipped.
import React from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
import SampleCard from './SampleCard';


export default function MoleculeGallery () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  if (!reg) {
    return null;
  }

  const Component = reg.Component;
  const keys = reg.buckets.molecule;

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Molecules ({keys.length})</C.Text>
      <C.Text color="text_secondary">Compositions of atoms — form, display, and overlay concerns.</C.Text>

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
