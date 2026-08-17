// Info: Molecule gallery. Each molecule gets a dedicated full-width row showing
// multiple visual states where applicable. Components with interactive states
// (toggles, inputs, selections) respond to user input. The roster is registry-
// driven - every molecule in the package appears here.
import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
const { ShowcaseRow, StateCell } = require('./ShowcaseRow');
import SafeSample from './SafeSample';

const HINT_PROPS = require('@superloomdev/rnw-components-carbon/data/hint-props');


const noop = function () {};


// ---- Interactive molecule rows ----

function PasswordInputRow ({ C, R }) {
  const [val, setVal] = useState('');
  return (
    <ShowcaseRow name="PasswordInput" C={C}>
      <StateCell label="default" C={C}>
        <R.PasswordInput value={val} onChange={setVal} placeholder="Password" style={{ width: 200 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <R.PasswordInput value="secret123" onChange={noop} style={{ width: 200 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <R.PasswordInput value="disabled" onChange={noop} disabled style={{ width: 180 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

function SearchRow ({ C, R }) {
  const [val, setVal] = useState('');
  return (
    <ShowcaseRow name="Search" C={C}>
      <StateCell label="default" C={C}>
        <R.Search value={val} onChange={setVal} placeholder="Search..." style={{ width: 220 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <R.Search value="React Native" onChange={noop} style={{ width: 220 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <R.Search value="" onChange={noop} placeholder="Disabled" disabled style={{ width: 180 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

function ExpandableSearchRow ({ C, R }) {
  const [val, setVal] = useState('');
  return (
    <ShowcaseRow name="ExpandableSearch" C={C}>
      <StateCell label="default" C={C}>
        <R.ExpandableSearch value={val} onChange={setVal} placeholder="Search..." style={{ width: 220 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

function NumberInputRow ({ C, R }) {
  const [val, setVal] = useState(5);
  return (
    <ShowcaseRow name="NumberInput" C={C}>
      <StateCell label="default" C={C}>
        <R.NumberInput value={val} onChange={setVal} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <R.NumberInput value={10} onChange={noop} disabled style={{ width: 180 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

function SwitchRow ({ C, R }) {
  const [on, setOn] = useState(true);
  const toggle = useCallback(function () {
    setOn(function (v) {
      return !v;
    });
  }, []);
  return (
    <ShowcaseRow name="Switch" C={C}>
      <StateCell label="interactive" C={C}><R.Switch label="Switch" selected={on} onPress={toggle} /></StateCell>
      <StateCell label="on" C={C}><R.Switch label="On" selected={true} onPress={noop} /></StateCell>
      <StateCell label="off" C={C}><R.Switch label="Off" selected={false} onPress={noop} /></StateCell>
      <StateCell label="disabled" C={C}><R.Switch label="Disabled" selected={true} onPress={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

function MenuItemRow ({ C, R }) {
  return (
    <ShowcaseRow name="MenuItem" C={C}>
      <StateCell label="default" C={C}><R.MenuItem label="Menu item" onPress={noop} /></StateCell>
      <StateCell label="with icon" C={C}><R.MenuItem label="With icon" icon="add" onPress={noop} /></StateCell>
      <StateCell label="disabled" C={C}><R.MenuItem label="Disabled" onPress={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

function IconSwitchRow ({ C, R }) {
  const [on, setOn] = useState(true);
  const toggle = useCallback(function () {
    setOn(function (v) {
      return !v;
    });
  }, []);
  return (
    <ShowcaseRow name="IconSwitch" C={C}>
      <StateCell label="interactive" C={C}><R.IconSwitch icon="add" checked={on} onToggle={toggle} /></StateCell>
      <StateCell label="on" C={C}><R.IconSwitch icon="add" checked={true} onToggle={noop} /></StateCell>
      <StateCell label="off" C={C}><R.IconSwitch icon="add" checked={false} onToggle={noop} /></StateCell>
    </ShowcaseRow>
  );
}


// ---- Static multi-state molecule rows (keyed by component name) ----

const MULTI_STATE = {
  // Notifications
  InlineNotification: [
    { label: 'info', props: { title: 'Info', subtitle: 'Informational message', kind: 'info' } },
    { label: 'success', props: { title: 'Success', subtitle: 'Operation completed', kind: 'success' } },
    { label: 'warning', props: { title: 'Warning', subtitle: 'Check your input', kind: 'warning' } },
    { label: 'error', props: { title: 'Error', subtitle: 'Something failed', kind: 'error' } }
  ],
  ActionableNotification: [
    { label: 'info', props: { title: 'Info', subtitle: 'Informational', kind: 'info' } },
    { label: 'error', props: { title: 'Error', subtitle: 'Action required', kind: 'error' } }
  ],
  ToastNotification: [
    { label: 'info', props: { title: 'Info', subtitle: 'Message sent' } },
    { label: 'success', props: { title: 'Success', subtitle: 'Saved successfully' } }
  ],
  StaticNotification: [
    { label: 'info', props: { title: 'Info', subtitle: 'Static notification' } },
    { label: 'warning', props: { title: 'Warning', subtitle: 'Please review' } }
  ],
  Notification: [
    { label: 'default', props: { title: 'Notice', subtitle: 'General notification' } }
  ],
  Callout: [
    { label: 'default', props: { title: 'Callout', children: 'Important information here' } },
    { label: 'info', props: { title: 'Info', children: 'Informational callout', kind: 'info' } }
  ],

  // Text display
  CodeSnippet: [
    { label: 'inline', props: { code: 'npm install' } },
    { label: 'long code', props: { code: 'npx create-expo-app my-app --template blank' } }
  ],
  CopyButton: [
    { label: 'default', props: { text: 'Copied!', onCopy: noop } }
  ],
  Filename: [
    { label: 'default', props: { name: 'document.pdf' } },
    { label: 'long', props: { name: 'very-long-filename-that-should-truncate.tsx' } }
  ],
  TruncatedText: [
    { label: '1 line', props: { children: 'A very long piece of text that should truncate at the first line', maxLines: 1 } },
    { label: '2 lines', props: { children: 'A very long piece of text that should truncate. This text has more content to show two lines of text before truncating.', maxLines: 2 } }
  ],

  // Navigation
  Tab: [
    { label: 'default', props: { label: 'Tab 1', onPress: noop } },
    { label: 'active', props: { label: 'Active', onPress: noop, selected: true } },
    { label: 'disabled', props: { label: 'Disabled', onPress: noop, disabled: true } }
  ],
  BreadcrumbItem: [
    { label: 'default', props: { children: 'Home', href: '#' } },
    { label: 'current', props: { children: 'Current page', isCurrentPage: true } }
  ],
  PaginationNav: [
    { label: 'page 1 of 5', props: { totalPages: 5, currentPage: 1, onChange: noop } },
    { label: 'page 3 of 5', props: { totalPages: 5, currentPage: 3, onChange: noop } }
  ],
  SideNavLink: [
    { label: 'default', props: { text: 'Dashboard', onPress: noop } },
    { label: 'active', props: { text: 'Active', onPress: noop, active: true } }
  ],
  HeaderName: [
    { label: 'default', props: { text: 'Nimbus' } }
  ],
  HeaderMenuItem: [
    { label: 'default', props: { text: 'Products', onPress: noop } }
  ],
  HeaderGlobalAction: [
    { label: 'default', props: { icon: 'notifications-outline', onPress: noop } }
  ],

  // Tiles
  Tile: [
    { label: 'default', props: { title: 'Basic tile' } }
  ],
  ClickableTile: [
    { label: 'default', props: { title: 'Click me', onPress: noop } },
    { label: 'disabled', props: { title: 'Disabled', onPress: noop, disabled: true } }
  ],
  SelectableTile: [
    { label: 'unselected', props: { title: 'Select me' } },
    { label: 'selected', props: { title: 'Selected', selected: true } }
  ],

  // Tags
  DismissibleTag: [
    { label: 'default', props: { text: 'Dismissible', onDismiss: noop } }
  ],
  OperationalTag: [
    { label: 'default', props: { text: 'Operational' } }
  ],
  SelectableTag: [
    { label: 'default', props: { text: 'Selectable' } },
    { label: 'selected', props: { text: 'Selected', selected: true } }
  ],

  // Form elements
  FormLabel: [
    { label: 'default', props: { children: 'Username' } },
    { label: 'required', props: { children: 'Email', required: true } }
  ],
  FormItem: [
    { label: 'default', props: { children: 'Form field' } }
  ],

  // List items
  ListItem: [
    { label: 'default', props: { title: 'List item' } },
    { label: 'with subtitle', props: { title: 'List item', subtitle: 'Description text' } }
  ],
  ContainedListItem: [
    { label: 'default', props: { children: 'Contained item' } }
  ],
  NavigationListItem: [
    { label: 'default', props: { title: 'Nav item' } },
    { label: 'active', props: { title: 'Active', active: true } }
  ],

  // Accordion
  AccordionItem: [
    { label: 'collapsed', props: { title: 'Section 1', children: 'Content' } },
    { label: 'expanded', props: { title: 'Section 2', children: 'Expanded content', open: true } }
  ],

  // Progress
  ProgressStep: [
    { label: 'complete', props: { label: 'Step 1', complete: true } },
    { label: 'current', props: { label: 'Step 2', current: true } },
    { label: 'incomplete', props: { label: 'Step 3' } }
  ],
  InlineLoading: [
    { label: 'active', props: { status: 'active', label: 'Loading data...' } },
    { label: 'finished', props: { status: 'finished', label: 'Done!' } },
    { label: 'error', props: { status: 'error', label: 'Failed' } }
  ],

  // Skeleton variants
  SkeletonText: [
    { label: 'single', props: { width: 160 } },
    { label: 'paragraph', props: { width: 240, lines: 3 } }
  ],
  SkeletonPlaceholder: [
    { label: 'default', props: { width: 120, height: 40 } },
    { label: 'large', props: { width: 200, height: 80 } }
  ],
  SkeletonIcon: [
    { label: 'default', props: {} }
  ],

  // User
  UserAvatar: [
    { label: 'initials', props: { initials: 'SJ' } },
    { label: 'large', props: { initials: 'AB', size: 'lg' } }
  ],

  // Error
  ErrorState: [
    { label: 'default', props: { title: 'Something went wrong', subtitle: 'Please try again later' } }
  ],

  // Dropdowns
  Dropdown: [
    { label: 'default', props: { triggerLabel: 'Select option', items: [], onSelect: noop } }
  ],
  DatePickerInput: [
    { label: 'default', props: { placeholder: 'mm/dd/yyyy' } }
  ],

  // Layout
  Stack: [
    { label: 'vertical', props: { children: 'Stacked content' } }
  ],
  HStack: [
    { label: 'horizontal', props: { children: 'Horizontal' } }
  ],
  VStack: [
    { label: 'vertical', props: { children: 'Vertical' } }
  ],

  // Table components with sample data
  DataTable: [
    { label: 'default', props: { children: 'Table data' } }
  ],
  Table: [
    { label: 'default', props: { children: 'Table' } }
  ],

  // Tooltips
  Tooltip: [
    { label: 'default', props: { label: 'Helpful information' } }
  ],
  DefinitionTooltip: [
    { label: 'default', props: { term: 'RNW', definition: 'React Native Web' } }
  ],

  // Modal parts
  ModalHeader: [
    { label: 'default', props: { title: 'Modal Title' } }
  ],
  ModalBody: [
    { label: 'default', props: { children: 'Modal body content goes here' } }
  ],
  ModalFooter: [
    { label: 'default', props: { children: 'Footer' } }
  ],

  // Overflow
  OverflowMenuItem: [
    { label: 'default', props: { text: 'Option 1', onPress: noop } },
    { label: 'danger', props: { text: 'Delete', onPress: noop, hasDivider: true } }
  ],

  // Popover
  Popover: [
    { label: 'default', props: { children: 'Content' } }
  ]
};


// Components handled by custom interactive rows above
const CUSTOM_ROWS = {
  PasswordInput: true,
  Search: true,
  ExpandableSearch: true,
  NumberInput: true,
  Switch: true,
  MenuItem: true,
  IconSwitch: true
};


// Default single-state row for molecules without custom state definitions
function DefaultMoleculeRow ({ name, Comp, hint, C }) {
  return (
    <ShowcaseRow name={name} C={C}>
      <StateCell label="default" C={C}>
        <SafeSample name={name}>
          <Comp {...hint} />
        </SafeSample>
      </StateCell>
    </ShowcaseRow>
  );
}


// Multi-state row from the MULTI_STATE configuration
function MultiStateMoleculeRow ({ name, Comp, states, C }) {
  return (
    <ShowcaseRow name={name} C={C}>
      {states.map(function (state) {
        return (
          <StateCell key={state.label} label={state.label} C={C}>
            <SafeSample name={name + ' ' + state.label}>
              <Comp {...state.props} />
            </SafeSample>
          </StateCell>
        );
      })}
    </ShowcaseRow>
  );
}


export default function MoleculeGallery () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  if (!reg) {
    return null;
  }

  // R = full Carbon registry components (for showcased items)
  // C = demo ThemeContext components (for layout text only: C.Text, C.View)
  const R = reg.Component;
  const keys = reg.buckets.molecule;

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Molecules ({keys.length})</C.Text>
      <C.Text color="text_secondary">Each molecule with its visual states. Interactive components respond to input.</C.Text>

      {/* Custom interactive rows first */}
      {R.PasswordInput ? <PasswordInputRow C={C} R={R} /> : null}
      {R.Search ? <SearchRow C={C} R={R} /> : null}
      {R.ExpandableSearch ? <ExpandableSearchRow C={C} R={R} /> : null}
      {R.NumberInput ? <NumberInputRow C={C} R={R} /> : null}
      {R.Switch ? <SwitchRow C={C} R={R} /> : null}
      {R.MenuItem ? <MenuItemRow C={C} R={R} /> : null}
      {R.IconSwitch ? <IconSwitchRow C={C} R={R} /> : null}

      {/* All other molecules in alphabetical order */}
      {keys.map(function (k) {
        if (CUSTOM_ROWS[k]) {
          return null;
        }
        const Comp = R[k];
        if (!Comp) {
          return null;
        }
        const states = MULTI_STATE[k];
        if (states) {
          return <MultiStateMoleculeRow key={k} name={k} Comp={Comp} states={states} C={C} />;
        }
        const hint = HINT_PROPS[k] || {};
        return <DefaultMoleculeRow key={k} name={k} Comp={Comp} hint={hint} C={C} />;
      })}

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}><C.Text color="app_primary" weight="medium">Back to showcase</C.Text></Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' },
  back: { alignItems: 'center', paddingVertical: 12 }
});
