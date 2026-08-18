// Info: One-stop showcase registry hook. Builds the themed Carbon registry
// (via useCarbonRegistry) and buckets the live Object.keys(Component) roster
// into Carbon tiers using the source-derived tier metadata. Returns the
// Component registry plus per-tier counts so the index and galleries never
// reference a hardcoded roster.
import { useMemo } from 'react';

import useCarbonRegistry from './useCarbonRegistry';
const tiers = require('./tiers');


export default function useShowcaseRegistry () {

  // Build the themed Carbon registry from the live theme
  const built = useCarbonRegistry();

  // Return the memoized showcase registry so it recomputes only when built changes
  return useMemo(function () {

    // Return null while the Carbon registry is still being built
    if (!built) {
      // Return null so callers know the showcase registry is not ready
      return null;
    }

    // Extract the Component registry and bucket the live keys into tiers
    const Component = built.Component;
    const buckets = tiers.classify(Component);

    // Compute per-tier counts from the bucketed roster for the index and galleries
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

    // Return the assembled showcase registry with components, buckets, and counts
    return { Component: Component, Style: built.Style, buckets: buckets, counts: counts };

  }, [built]);

}
