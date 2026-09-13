// Info: Expo adapter for the Icons slot (Plan 0156, Part C).
//
// Maps the semantic icon manifest onto @expo/vector-icons/Ionicons. The
// manifest (data/icon-names.json) is the single source of truth for
// semantic names; this adapter resolves each name to an Ionicons glyph.
//
// Expo continues using Ionicons until react-native-svg is adopted (backlog).
// The semantic manifest ensures name resolution is consistent across hosts.
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import manifest from '@superloomdev/rnw-components/data/icon-names.json';

// Build a lookup from semantic name (and aliases) to Ionicons name
const NAME_TO_IONICONS = {};

for (const [semanticName, entry] of Object.entries(manifest.icons)) {
  const ioniconsName = entry.ionicons;
  if (ioniconsName) {
    // Ionicons uses kebab-case for icon names
    const kebabName = semanticName.replace(/_/g, '-');
    NAME_TO_IONICONS[kebabName] = ioniconsName;
  }
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      NAME_TO_IONICONS[alias] = ioniconsName;
    }
  }
}

// Resolve a semantic name to an Ionicons glyph name
function resolveIoniconsName (name) {
  if (!name) {
    return null;
  }
  // Try direct lookup
  if (NAME_TO_IONICONS[name]) {
    return NAME_TO_IONICONS[name];
  }
  // Try converting underscores to hyphens
  const kebabName = name.replace(/_/g, '-');
  if (NAME_TO_IONICONS[kebabName]) {
    return NAME_TO_IONICONS[kebabName];
  }
  // Fallback: return the name as-is (Ionicons may have it)
  return name;
}

// Wrap Ionicons to resolve names through the manifest
function ExpoIcon (props) {
  const { name, ...rest } = props;
  const resolvedName = resolveIoniconsName(name);
  return React.createElement(Ionicons, { name: resolvedName, ...rest });
}

export default function (Lib, config) { // eslint-disable-line no-unused-vars

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: ExpoIcon
  };

}
