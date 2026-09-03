// Info: Molecule gallery. Each molecule gets a dedicated full-width row showing
// multiple visual states where applicable. Components with interactive states
// (toggles, inputs, selections) respond to user input. The roster is registry-
// driven - every molecule in the package appears here.
import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';
import { ShowcaseRow, StateCell } from './ShowcaseRow.js';
import SafeSample from './SafeSample.js';


const noop = function () {};


// ---- Interactive molecule rows ----

function PasswordInputRow ({ C, R }) {
  // Track the interactive password input's value
  const [val, setVal] = useState('');
  // Render the password input row with default, filled, and disabled states
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
  // Track the interactive search input's value
  const [val, setVal] = useState('');
  // Render the search row with default, filled, and disabled states
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
  // Track the interactive expandable search input's value
  const [val, setVal] = useState('');
  // Render the expandable search row with a default interactive state
  return (
    <ShowcaseRow name="ExpandableSearch" C={C}>
      <StateCell label="default" C={C}>
        <R.ExpandableSearch value={val} onChange={setVal} placeholder="Search..." style={{ width: 220 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

function NumberInputRow ({ C, R }) {
  // Track the interactive number input's value
  const [val, setVal] = useState(5);
  // Render the number input row with default and disabled states
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
  // Track the interactive switch's on/off state
  const [on, setOn] = useState(true);
  // Toggle the switch state when the interactive switch is pressed
  const toggle = useCallback(function () {
    setOn(function (v) {
      // Flip the previous on/off value
      return !v;
    });
  }, []);
  // Render the switch row with interactive, on, off, and disabled states
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
  // Render the menu item row with default, icon, and disabled states
  return (
    <ShowcaseRow name="MenuItem" C={C}>
      <StateCell label="default" C={C}><R.MenuItem label="Menu item" onPress={noop} /></StateCell>
      <StateCell label="with icon" C={C}><R.MenuItem label="With icon" icon="add" onPress={noop} /></StateCell>
      <StateCell label="disabled" C={C}><R.MenuItem label="Disabled" onPress={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

function IconSwitchRow ({ C, R }) {
  // Track the interactive icon switch's checked state
  const [on, setOn] = useState(true);
  // Toggle the checked state when the interactive icon switch is pressed
  const toggle = useCallback(function () {
    setOn(function (v) {
      // Flip the previous checked value
      return !v;
    });
  }, []);
  // Render the icon switch row with interactive, on, and off states
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
  ],

  // ---- Batch 1: AI Skeleton family ----
  AISkeletonIcon: [
    { label: 'default', props: {} }
  ],
  AISkeletonPlaceholder: [
    { label: 'default', props: { width: 120, height: 40 } },
    { label: 'large', props: { width: 200, height: 80 } }
  ],
  AISkeletonText: [
    { label: 'single', props: { width: 160 } },
    { label: 'paragraph', props: { width: 240, lines: 3 } }
  ],

  // ---- Batch 2: AILabel parts ----
  AILabelActions: [
    { label: 'default', props: { children: 'Actions' } }
  ],
  AILabelContent: [
    { label: 'default', props: { children: 'Content' } }
  ],

  // ---- Batch 3: Bottom navigation / toolbar ----
  BottomNavigationBar: [
    { label: 'default', props: { items: [
      { icon: 'home-outline', text: 'Home', onPress: noop },
      { icon: 'search-outline', text: 'Search', onPress: noop, active: true },
      { icon: 'person-outline', text: 'Profile', onPress: noop }
    ] } }
  ],
  BottomSafeAreaColorOverride: [
    { label: 'default', props: { color: 'app_primary', children: 'Content above safe area' } }
  ],
  BottomToolbar: [
    { label: 'default', props: { items: [
      { text: 'New', icon: 'add', onPress: noop },
      { text: 'Edit', icon: 'create-outline', onPress: noop }
    ] } }
  ],
  BottomToolbarPrimaryAction: [
    { label: 'default', props: { primaryAction: { text: 'Save', onPress: noop }, items: [
      { text: 'Share', icon: 'share-outline', onPress: noop }
    ] } }
  ],

  // ---- Batch 4: ButtonSet ----
  ButtonSet: [
    { label: 'horizontal', props: { children: 'Buttons' } },
    { label: 'stacked', props: { children: 'Buttons', stacked: true } }
  ],

  // ---- Batch 5: Layout (Column, Row, Grid, FlexGrid, etc.) ----
  Column: [
    { label: 'default', props: { children: 'Column content' } },
    { label: 'span 2', props: { children: 'Span 2', span: 2 } }
  ],
  ColumnHang: [
    { label: 'default', props: { children: 'Hang content' } }
  ],
  Content: [
    { label: 'default', props: { children: 'Main content area' } }
  ],
  FlexGrid: [
    { label: 'default', props: { children: 'Grid items' } }
  ],
  Grid: [
    { label: '2 columns', props: { children: 'Grid content', columns: 2 } },
    { label: '3 columns', props: { children: 'Grid content', columns: 3 } }
  ],
  GridSettings: [
    { label: 'default', props: { columns: 3, gap: 'md' } }
  ],
  Row: [
    { label: 'default', props: { children: 'Row content' } }
  ],
  Section: [
    { label: 'default', props: { children: 'Section content' } }
  ],
  LandingView: [
    { label: 'default', props: { children: 'Landing page content' } }
  ],
  SafeAreaWrapper: [
    { label: 'default', props: { children: 'Safe area content' } }
  ],
  ViewWrapper: [
    { label: 'default', props: { children: 'Wrapped content' } }
  ],
  SkipToContent: [
    { label: 'default', props: { targetId: 'main-content' } }
  ],

  // ---- Batch 6: ContainedList and List families ----
  ContainedList: [
    // A list needs room to read as a list; the default cell width collapses the
    // bordered container to the width of its own label
    { label: 'default', props: { label: 'My list', children: 'List items' }, stageWidth: 240 }
  ],
  List: [
    { label: 'unordered', props: { children: 'List items' } },
    { label: 'ordered', props: { children: 'List items', ordered: true } }
  ],
  OrderedList: [
    { label: 'default', props: { children: 'Ordered items' } }
  ],
  UnorderedList: [
    { label: 'default', props: { children: 'Unordered items' } }
  ],
  NavigationList: [
    { label: 'default', props: { title: 'Navigation', children: 'Nav items' } }
  ],

  // ---- Batch 7: ControlledPasswordInput and Copy ----
  ControlledPasswordInput: [
    { label: 'default', props: { value: '', onChange: noop, placeholder: 'Password' } },
    { label: 'with text', props: { value: 'secret', onChange: noop } },
    { label: 'disabled', props: { value: 'disabled', onChange: noop, disabled: true } }
  ],
  Copy: [
    { label: 'default', props: { text: 'Copy this text', onSuccess: noop } }
  ],

  // ---- Batch 8: DocumentViewer ----
  DocumentViewer: [
    { label: 'default', props: { source: '<p>Document content</p>' } }
  ],

  // ---- Batch 9: ErrorBoundaryContext, FormContext, GlobalTheme, PrefixContext, ThemeContext ----
  ErrorBoundaryContext: [
    { label: 'default', props: { children: 'Protected content' } }
  ],
  FormContext: [
    { label: 'default', props: { children: 'Form content' } }
  ],
  GlobalTheme: [
    { label: 'default', props: { children: 'Themed content' } }
  ],
  PrefixContext: [
    { label: 'default', props: { children: 'Prefixed content' } }
  ],
  ThemeContext: [
    { label: 'default', props: { children: 'Themed content' } }
  ],
  GrantPermission: [
    { label: 'default', props: { title: 'Allow Notifications', subtitle: 'Get updates on new messages', onGrant: noop } }
  ],

  // ---- Batch 10: ExpandableTile and Tile parts ----
  ExpandableTile: [
    { label: 'collapsed', props: { title: 'Expandable tile', children: 'Hidden content' } },
    { label: 'expanded', props: { title: 'Expandable tile', children: 'Visible content', expanded: true } }
  ],
  TileAboveTheFoldContent: [
    { label: 'default', props: { children: 'Above the fold' } }
  ],
  TileBelowTheFoldContent: [
    { label: 'default', props: { children: 'Below the fold' } }
  ],
  TileGroup: [
    { label: 'default', props: { children: 'Tiles' } }
  ],
  RadioTile: [
    { label: 'default', props: { name: 'group', value: 'opt1', checked: false, onSelect: noop } },
    { label: 'selected', props: { name: 'group', value: 'opt1', checked: true, onSelect: noop } }
  ],

  // ---- Batch 11: FileUploader parts ----
  FileUploaderButton: [
    { label: 'default', props: { label: 'Upload file', onPress: noop } },
    { label: 'disabled', props: { label: 'Upload file', onPress: noop, disabled: true } }
  ],
  FileUploaderDropContainer: [
    { label: 'default', props: { label: 'Drop files here', onDrop: noop } }
  ],
  FileUploaderItem: [
    { label: 'uploading', props: { filename: 'photo.jpg', status: 'uploading', onRemove: noop } },
    { label: 'complete', props: { filename: 'doc.pdf', status: 'complete', onRemove: noop } }
  ],

  // ---- Batch 12: Form ----
  Form: [
    { label: 'default', props: { children: 'Form fields', onSubmit: noop } }
  ],

  // ---- Batch 13: Header parts ----
  HeaderContainer: [
    { label: 'default', props: { children: 'Header' } }
  ],
  HeaderGlobalBar: [
    { label: 'default', props: { children: 'Actions' } }
  ],
  HeaderMenu: [
    { label: 'default', props: { label: 'Menu', children: 'Menu items' } }
  ],
  HeaderMenuButton: [
    { label: 'default', props: { label: 'Menu', onPress: noop } },
    { label: 'active', props: { label: 'Menu', onPress: noop, isActive: true } }
  ],
  HeaderNavigation: [
    { label: 'default', props: { children: 'Nav links' } }
  ],
  HeaderPanel: [
    { label: 'collapsed', props: { children: 'Panel content' } },
    { label: 'expanded', props: { children: 'Panel content', expanded: true } }
  ],
  HeaderSideNavItems: [
    { label: 'default', props: { children: 'Side nav items' } }
  ],

  // ---- Batch 14: IconButton and IconTab ----
  IconButton: [
    { label: 'default', props: { name: 'add', onPress: noop, label: 'Add' } },
    { label: 'disabled', props: { name: 'add', onPress: noop, label: 'Add', disabled: true } }
  ],
  IconTab: [
    { label: 'default', props: { icon: 'home-outline', onPress: noop } },
    { label: 'active', props: { icon: 'home-outline', onPress: noop, active: true } }
  ],

  // ---- Batch 15: Menu parts ----
  MenuItemDivider: [
    { label: 'default', props: {} }
  ],
  MenuItemGroup: [
    { label: 'default', props: { label: 'Group', children: 'Menu items' } }
  ],
  MenuItemSelectable: [
    { label: 'unchecked', props: { label: 'Option', checked: false, onChange: noop } },
    { label: 'checked', props: { label: 'Option', checked: true, onChange: noop } },
    { label: 'disabled', props: { label: 'Option', checked: false, onChange: noop, disabled: true } }
  ],

  // ---- Batch 16: Modal ----
  Modal: [
    { label: 'closed', props: { isOpen: false, onClose: noop, children: 'Modal content' } }
  ],

  // ---- Batch 17: Notification parts ----
  NotificationActionButton: [
    { label: 'default', props: { text: 'Action', onPress: noop } }
  ],
  NotificationButton: [
    { label: 'default', props: { onPress: noop } }
  ],

  // ---- Batch 18: PopoverContent ----
  PopoverContent: [
    { label: 'default', props: { children: 'Popover content' } }
  ],

  // ---- Batch 19: Select parts ----
  SelectItem: [
    { label: 'default', props: { value: 'opt1', text: 'Option 1', onSelect: noop } },
    { label: 'disabled', props: { value: 'opt2', text: 'Option 2', onSelect: noop, disabled: true } }
  ],
  SelectItemGroup: [
    { label: 'default', props: { label: 'Group', children: 'Select items' } }
  ],

  // ---- Batch 20: SideNav family ----
  SideNav: [
    { label: 'expanded', props: { children: 'Side nav content', expanded: true } },
    { label: 'collapsed', props: { children: 'Side nav content', expanded: false } }
  ],
  SideNavDetails: [
    { label: 'default', props: { title: 'Details', children: 'Detail content' } }
  ],
  SideNavDivider: [
    { label: 'default', props: {} }
  ],
  SideNavFooter: [
    { label: 'default', props: { children: 'Footer content' } }
  ],
  SideNavHeader: [
    { label: 'default', props: { title: 'Section', children: 'Header content' } }
  ],
  SideNavIcon: [
    { label: 'default', props: { name: 'home-outline' } }
  ],
  SideNavItem: [
    { label: 'default', props: { text: 'Item', onPress: noop } },
    { label: 'active', props: { text: 'Active', onPress: noop, active: true } }
  ],
  SideNavItems: [
    { label: 'default', props: { children: 'Side nav items' } }
  ],
  SideNavLinkText: [
    { label: 'default', props: { children: 'Link text' } }
  ],
  SideNavMenu: [
    { label: 'collapsed', props: { label: 'Menu', onToggle: noop, children: 'Menu items' } },
    { label: 'expanded', props: { label: 'Menu', onToggle: noop, children: 'Menu items', expanded: true } }
  ],
  SideNavMenuItem: [
    { label: 'default', props: { text: 'Sub item', onPress: noop } }
  ],
  SideNavSwitcher: [
    { label: 'default', props: { label: 'Switch', options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' }
    ], onChange: noop } }
  ],

  // ---- Batch 21: StructuredList family ----
  StructuredListWrapper: [
    { label: 'default', props: { children: 'Structured list' } }
  ],
  StructuredListHead: [
    { label: 'default', props: { children: 'Header row' } }
  ],
  StructuredListBody: [
    { label: 'default', props: { children: 'Body rows' } }
  ],
  StructuredListRow: [
    { label: 'default', props: { children: 'Cells' } }
  ],
  StructuredListCell: [
    { label: 'default', props: { children: 'Cell content' } }
  ],
  StructuredListInput: [
    { label: 'unchecked', props: { name: 'group', value: 'opt1', checked: false, onChange: noop } },
    { label: 'checked', props: { name: 'group', value: 'opt1', checked: true, onChange: noop } }
  ],

  // ---- Batch 22: Switcher family ----
  Switcher: [
    { label: 'default', props: { children: 'Switcher items' } }
  ],
  SwitcherDivider: [
    { label: 'default', props: {} }
  ],
  SwitcherItem: [
    { label: 'default', props: { text: 'Item', onPress: noop } }
  ],

  // ---- Batch 23: Tab parts ----
  TabContent: [
    { label: 'default', props: { children: 'Tab content' } }
  ],
  TabList: [
    { label: 'default', props: { children: 'Tabs' } }
  ],
  TabListVertical: [
    { label: 'default', props: { children: 'Vertical tabs' } }
  ],
  TabPanel: [
    { label: 'default', props: { children: 'Panel content' } },
    { label: 'selected', props: { children: 'Active panel', selected: true } }
  ],
  TabPanels: [
    { label: 'default', props: { children: 'Panels' } }
  ],

  // ---- Batch 24: Table family ----
  TableContainer: [
    { label: 'default', props: { children: 'Table' } }
  ],
  TableHead: [
    { label: 'default', props: { children: 'Header row' } }
  ],
  TableBody: [
    { label: 'default', props: { children: 'Body rows' } }
  ],
  TableRow: [
    { label: 'default', props: { children: 'Cells' } }
  ],
  TableHeader: [
    { label: 'default', props: { children: 'Header' } }
  ],
  TableCell: [
    { label: 'default', props: { children: 'Cell' } }
  ],
  TableActionList: [
    { label: 'default', props: { children: 'Actions' } }
  ],
  TableBatchAction: [
    { label: 'default', props: { label: 'Delete', onPress: noop } },
    { label: 'disabled', props: { label: 'Delete', onPress: noop, disabled: true } }
  ],
  TableBatchActions: [
    { label: 'default', props: { children: 'Batch actions' } }
  ],
  TableDecoratorRow: [
    { label: 'default', props: {} }
  ],
  TableExpandHeader: [
    { label: 'collapsed', props: { isExpanded: false, onToggle: noop } },
    { label: 'expanded', props: { isExpanded: true, onToggle: noop } }
  ],
  TableExpandRow: [
    { label: 'collapsed', props: { isExpanded: false, onToggle: noop, children: 'Row cells' } },
    { label: 'expanded', props: { isExpanded: true, onToggle: noop, children: 'Row cells' } }
  ],
  TableExpandedRow: [
    { label: 'default', props: { children: 'Expanded content' } }
  ],
  TableSelectAll: [
    { label: 'unchecked', props: { checked: false, onSelectAll: noop, ariaLabel: 'Select all' } },
    { label: 'checked', props: { checked: true, onSelectAll: noop, ariaLabel: 'Select all' } }
  ],
  TableSelectRow: [
    { label: 'unchecked', props: { checked: false, onSelect: noop, ariaLabel: 'Select row' } },
    { label: 'checked', props: { checked: true, onSelect: noop, ariaLabel: 'Select row' } }
  ],
  TableSlugRow: [
    { label: 'default', props: { slug: 'Info', children: 'Row cells' } }
  ],
  TableToolbar: [
    { label: 'default', props: { children: 'Toolbar' } }
  ],
  TableToolbarAction: [
    { label: 'default', props: { icon: 'download-outline', onPress: noop, label: 'Download' } }
  ],
  TableToolbarContent: [
    { label: 'default', props: { children: 'Toolbar content' } }
  ],
  TableToolbarMenu: [
    { label: 'default', props: { label: 'Options', children: [] } }
  ],
  TableToolbarSearch: [
    { label: 'default', props: { value: '', onChange: noop, placeholder: 'Search' } }
  ],

  // ---- Batch 25: DataTable parts ----
  DataTableCell: [
    { label: 'default', props: { content: 'Cell value' } },
    { label: 'header', props: { content: 'Column', type: 'header' } }
  ],
  DataTableHeader: [
    { label: 'default', props: { primaryAction: { label: 'Add', onPress: noop, kind: 'primary' } } }
  ],
  DataTableHeaderSelected: [
    { label: 'default', props: { selectedCount: 3, batchActions: [
      { label: 'Delete', onPress: noop, kind: 'danger' }
    ], onCancel: noop } }
  ],

  // ---- Batch 26: TimePickerSelect ----
  TimePickerSelect: [
    { label: 'default', props: { value: '12:00', onChange: noop, options: [
      { value: '12:00', label: '12:00 PM' },
      { value: '13:00', label: '1:00 PM' }
    ] } }
  ],

  // ---- Batch 27: Toggletip family ----
  Toggletip: [
    { label: 'default', props: { content: 'Helpful info', children: 'Trigger' } }
  ],
  ToggletipActions: [
    { label: 'default', props: { children: 'Actions' } }
  ],
  ToggletipButton: [
    { label: 'default', props: { text: 'Learn more', onPress: noop } }
  ],
  ToggletipContent: [
    { label: 'default', props: { children: 'Toggletip content' } }
  ],

  // ---- Batch 28: TopNavigationBar ----
  TopNavigationBar: [
    { label: 'default', props: { title: 'My App', leftItems: [
      { icon: 'menu-outline', text: 'Menu', onPress: noop }
    ], rightItems: [
      { icon: 'search-outline', text: 'Search', onPress: noop }
    ] } }
  ],
  TopNavigationBarLogin: [
    { label: 'default', props: { title: 'Welcome', loginAction: { text: 'Sign in', onPress: noop } } }
  ],

  // ---- Batch 29: TreeNode ----
  TreeNode: [
    { label: 'collapsed', props: { label: 'Parent node', level: 1, onToggle: noop } },
    { label: 'expanded', props: { label: 'Parent node', level: 1, expanded: true, onToggle: noop, children: 'Child nodes' } },
    { label: 'selected', props: { label: 'Selected node', level: 1, selected: true, onToggle: noop } }
  ],

  // ---- Batch 30: UiPanel ----
  UiPanel: [
    { label: 'expanded', props: { title: 'Settings', collapsed: false, onToggle: noop, children: 'Panel content' } },
    { label: 'collapsed', props: { title: 'Settings', collapsed: true, onToggle: noop, children: 'Panel content' } }
  ],
  UiPanelItem: [
    { label: 'default', props: { text: 'Item', onPress: noop } },
    { label: 'with icon', props: { text: 'Item', icon: 'settings-outline', onPress: noop } }
  ],

  // ---- Batch 31: WebHeader ----
  WebHeader: [
    { label: 'default', props: { children: 'Header content' } }
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


// Multi-state row from the MULTI_STATE configuration
function MultiStateMoleculeRow ({ name, Comp, states, C }) {
  // Render one showcase row with a state cell per defined state
  return (
    <ShowcaseRow name={name} C={C}>
      {states.map(function (state) {
        // Render one error-isolated state cell per configured state
        return (
          <StateCell key={state.label} label={state.label} C={C} stageWidth={state.stageWidth}>
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

  // Resolve the live lib, navigation helpers, themed components, and showcase registry
  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  // Wait for the registry before rendering anything
  if (!reg) {
    // Render nothing while the registry is loading
    return null;
  }

  // R = full Carbon registry components (for showcased items)
  // C = demo ThemeContext components (for layout text only: C.Text, C.View)
  const R = reg.Component;
  const keys = reg.buckets.molecule;

  // Render the molecule gallery with custom interactive rows and multi-state rows
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
        // Skip components that have custom interactive rows above
        if (CUSTOM_ROWS[k]) {
          // Skip custom-row components in the generic loop
          return null;
        }
        const Comp = R[k];
        // Skip if the component is not available in the registry
        if (!Comp) {
          // Skip missing components gracefully
          return null;
        }
        const states = MULTI_STATE[k];
        if (states) {
          // Render a multi-state row for components with defined states
          return <MultiStateMoleculeRow key={k} name={k} Comp={Comp} states={states} C={C} />;
        }
        // Skip components without any defined states
        return null;
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
