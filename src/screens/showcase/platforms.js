// Info: Platform-capability metadata for the Carbon roster. The roster itself
// is read live from Object.keys(Component) by the parity screen; this map only
// carries the per-component platform capability for components that are NOT
// universal ("both"). Any live key not listed here is treated as "both" (the
// package default for an RNW library), so the roster can never drift - only
// the capability label degrades to the default.
//
// Source-derived: extracted from the package's own component-roster fixture
// (generated against @carbon/react and @carbon/react-native). "both" entries
// are omitted to keep the map small; the default covers them.


// name -> capability for non-universal components. Universal ("both") is the
// implicit default and therefore not stored.
const NON_BOTH = {
  ActionSheet: 'split',
  BottomSafeAreaColorOverride: 'native-primary',
  CodeSnippet: 'split',
  CopyButton: 'split',
  DocumentViewer: 'split',
  FileUploader: 'split',
  FileUploaderButton: 'split',
  FileUploaderDropContainer: 'split',
  FileUploaderItem: 'split',
  GrantPermission: 'native-primary',
  Overlay: 'split',
  SafeAreaWrapper: 'native-primary',
  SkipToContent: 'web-primary',
  ViewWrapper: 'native-primary'
};


// Human-readable label for each capability.
const LABELS = {
  'both': 'Web · iOS · Android',
  'split': 'Web + Native (split impl)',
  'native-primary': 'iOS · Android (native-first)',
  'web-primary': 'Web (web-first)',
  'excluded': 'Excluded from build'
};


// Per-platform support for each capability. 'full' = supported, 'partial' =
// secondary target, 'none' = not supported. Used by the parity badges.
const SUPPORT = {
  'both': { web: 'full', ios: 'full', android: 'full' },
  'split': { web: 'full', ios: 'full', android: 'full' },
  'native-primary': { web: 'partial', ios: 'full', android: 'full' },
  'web-primary': { web: 'full', ios: 'partial', android: 'partial' },
  'excluded': { web: 'none', ios: 'none', android: 'none' }
};


// Resolve the capability key for a component name (defaults to "both").
function capability (name) {
  // Return the mapped capability or the universal default
  return NON_BOTH[name] || 'both';
}


export default {
  NON_BOTH: NON_BOTH,
  LABELS: LABELS,
  SUPPORT: SUPPORT,
  capability: capability
};
