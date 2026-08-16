// Info: One registry component rendered in a labelled, error-isolated card.
// The name is always shown; the component itself is mounted inside SafeSample
// with minimal props so a component that needs specific props/children to
// render degrades to a neutral fallback instead of crashing the gallery.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SafeSample from './SafeSample';


// Minimal props for a handful of components that need a label to render
// visibly. This is rendering hints, NOT a roster — the roster comes from
// Object.keys(Component) in the gallery. Anything not listed here renders with
// no props and is caught by SafeSample if it throws.
const HINT_PROPS = {
  Button: { title: 'Button', onPress: function () {} },
  IconButton: { name: 'add', onPress: function () {} },
  Tag: { children: 'Tag' },
  Heading: { children: 'Heading' },
  Text: { children: 'Text' },
  Link: { children: 'Link', onPress: function () {} },
  InlineLink: { children: 'Inline link', onPress: function () {} },
  ProgressBar: { value: 0.6 },
  Slider: { value: 0.5, onValueChange: function () {} },
  Toggle: { value: true, onValueChange: function () {} },
  Checkbox: { checked: true, onChange: function () {} },
  RadioButton: { checked: true, onChange: function () {} },
  Loading: { label: 'Loading' },
  InlineLoading: { label: 'Loading' },
  Skeleton: { width: 120, height: 16 },
  SkeletonText: { width: 160 },
  SkeletonPlaceholder: { width: 120, height: 40 },
  BadgeIndicator: { count: 5 },
  ShapeIndicator: { count: 3 },
  IconIndicator: { count: 2 },
  UserAvatar: { name: 'AB' },
  TruncatedText: { children: 'A long piece of text that should truncate', maxChars: 20 },
  CodeSnippet: { children: 'npm install' },
  CopyButton: { value: 'copied text', onPress: function () {} },
  FormLabel: { children: 'Label' },
  Notification: { title: 'Title', subtitle: 'Subtitle' },
  ToastNotification: { title: 'Title', subtitle: 'Subtitle' },
  StaticNotification: { title: 'Title', subtitle: 'Subtitle' },
  Callout: { title: 'Title', children: 'Body' },
  Tile: { children: 'Tile' },
  ClickableTile: { children: 'Clickable tile', onPress: function () {} },
  SelectableTile: { children: 'Selectable tile' },
  BreadcrumbItem: { children: 'Item', href: '#' },
  Tab: { children: 'Tab' },
  TabPanel: { children: 'Panel' },
  AccordionItem: { title: 'Item', children: 'Body' },
  ProgressStep: { label: 'Step' },
  Switch: { value: true, onValueChange: function () {} },
  TreeNode: { label: 'Node' },
  PaginationNav: { total: 5, current: 1 },
  MenuItem: { children: 'Menu item' },
  MenuItemSelectable: { children: 'Selectable', selected: false },
  ModalHeader: { title: 'Header' },
  ModalBody: { children: 'Body' },
  ModalFooter: { children: 'Footer' },
  Tooltip: { children: 'Hover me', label: 'Tooltip' },
  DefinitionTooltip: { children: 'Term', definition: 'Definition' },
  Toggletip: { children: 'Tip' },
  ErrorState: { title: 'Error', subtitle: 'Something went wrong' },
  LandingView: { children: 'Landing' },
  ListItem: { title: 'List item' },
  ContainedListItem: { children: 'List item' },
  NavigationListItem: { title: 'Nav item' },
  OrderedList: { children: 'List' },
  UnorderedList: { children: 'List' },
  StructuredListCell: { children: 'Cell' },
  StructuredListRow: { children: 'Row' },
  Column: { children: 'Column' },
  Row: { children: 'Row' },
  Grid: { children: 'Grid' },
  FlexGrid: { children: 'FlexGrid' },
  Stack: { children: 'Stack' },
  ButtonSet: { children: 'ButtonSet' },
  Section: { children: 'Section' },
  Content: { children: 'Content' },
  Copy: { children: 'Copy' },
  Filename: { children: 'file.txt' },
  HeaderName: { children: 'Nimbus' },
  HeaderMenuItem: { children: 'Item' },
  HeaderGlobalAction: { name: 'add', onPress: function () {} },
  SideNavLink: { children: 'Link' },
  SideNavItem: { children: 'Item' },
  SideNavMenu: { children: 'Menu' },
  SideNavSwitcher: { children: 'Switcher' },
  SwitcherItem: { children: 'Item' },
  SelectItem: { children: 'Option' },
  SelectableTag: { children: 'Tag' },
  DismissibleTag: { children: 'Tag' },
  OperationalTag: { children: 'Tag' },
  RadioTile: { children: 'Tile' },
  FileUploaderButton: { title: 'Upload' },
  TableToolbar: { children: 'Toolbar' },
  TableBatchAction: { children: 'Action' },
  TableBatchActions: { children: 'Actions' },
  TableActionList: { children: 'List' },
  OverflowMenuItem: { children: 'Item' },
  NotificationButton: { children: 'Button' },
  NotificationActionButton: { children: 'Action' },
  DatePickerInput: { label: 'Date' },
  PasswordInput: { label: 'Password' },
  NumberInput: { label: 'Number' },
  Search: { label: 'Search' },
  ExpandableSearch: { label: 'Search' },
  Dropdown: { label: 'Dropdown' },
  FormItem: { children: 'Item' },
  Form: { children: 'Form' },
  FormContext: { children: 'Form' },
  FormGroup: { children: 'Group' },
  PrefixContext: { children: 'Prefix' },
  ErrorBoundaryContext: { children: 'Boundary' },
  GlobalTheme: { children: 'Theme' },
  HeaderContainer: { children: 'Container' },
  HeaderMenu: { children: 'Menu' },
  HeaderPanel: { children: 'Panel' },
  HeaderSideNavItems: { children: 'Items' },
  SideNav: { children: 'Nav' },
  SideNavItems: { children: 'Items' },
  SideNavDivider: { children: 'Divider' },
  SideNavFooter: { children: 'Footer' },
  SideNavHeader: { children: 'Header' },
  SideNavIcon: { name: 'add' },
  SideNavDetails: { children: 'Details' },
  SideNavLinkText: { children: 'Link' },
  SideNavMenuItem: { children: 'Item' },
  SwitcherDivider: { children: 'Divider' },
  SkipToContent: { children: 'Skip' },
  HeaderNavigation: { children: 'Nav' },
  HeaderMenuButton: { onPress: function () {} },
  IconSwitch: { name: 'add' },
  IconTab: { children: 'Tab' },
  TabContent: { children: 'Content' },
  TableHeader: { children: 'Header' },
  TableBody: { children: 'Body' },
  TableHead: { children: 'Head' },
  TableRow: { children: 'Row' },
  TableCell: { children: 'Cell' },
  TableContainer: { children: 'Table' },
  StructuredListHead: { children: 'Head' },
  StructuredListBody: { children: 'Body' },
  StructuredListWrapper: { children: 'Wrapper' },
  StructuredListInput: { children: 'Input' },
  Table: { children: 'Table' },
  TableHeaderSelected: { count: 2 },
  UiPanelItem: { title: 'Item' },
  BottomToolbarPrimaryAction: { title: 'Action', onPress: function () {} },
  AcceptTerms: { children: 'Terms' },
  ActionableNotification: { title: 'Title', subtitle: 'Subtitle' }
};


export default function SampleCard ({ name, Component }) {

  const Comp = Component[name];
  const hint = HINT_PROPS[name] || null;

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{name}</Text>
      <View style={styles.stage}>
        <SafeSample name={name}>
          {Comp ? <Comp {...hint} /> : <Text style={styles.missing}>not in registry</Text>}
        </SafeSample>
      </View>
    </View>
  );

}


const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#525252', textTransform: 'none' },
  stage: { minHeight: 24 },
  missing: { fontSize: 12, color: '#8d8d8d' }
});
