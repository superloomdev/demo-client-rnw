// Info: One-stop showcase registry hook. Builds the themed Carbon registry
// (via useCarbonRegistry) and buckets the live Object.keys(Component) roster
// into Carbon tiers using the source-derived tier metadata. Returns the
// Component registry plus per-tier counts so the index and galleries never
// reference a hardcoded roster.
import { useMemo } from 'react';

import useCarbonRegistry from './useCarbonRegistry';
const tiers = require('./tiers');


export default function useShowcaseRegistry () {

  const built = useCarbonRegistry();

  return useMemo(function () {

    if (!built) {
      return null;
    }

    const Component = built.Component;
    const buckets = tiers.classify(Component);

    const counts = {
      atoms: buckets.atom.length,
      molecules: buckets.molecule.length,
      composites: buckets.composite.length,
      uncategorized: buckets.uncategorized.length,
      providers: Component.provider ? Object.keys(Component.provider).length : 0,
      variants: Component.variant ? Object.keys(Component.variant).length : 0,
      freeform: Component.freeform ? Object.keys(Component.freeform).length : 0,
      total: buckets.atom.length + buckets.molecule.length + buckets.composite.length + buckets.uncategorized.length
    };

    return { Component: Component, Style: built.Style, buckets: buckets, counts: counts };

  }, [built]);

}
