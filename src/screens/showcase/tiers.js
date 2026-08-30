// Info: Tier metadata for the Carbon component registry. The roster itself is
// always read live from Object.keys(Component) by the galleries; these arrays
// only bucket each live key into its Carbon tier (atom / molecule / composite)
// so the showcase can group components the way the Carbon design system does.
//
// Source-derived, not hand-maintained: every name below corresponds to a file
// in the published package's component/<tier>/ directory, which is the tier's
// only source of truth. A component that ships in the package but is not
// listed here is never hidden - classify() routes any unmapped live key into
// an 'uncategorized' bucket so the roster cannot drift.

const ATOMS = [
  'AspectRatio',
  'BadgeIndicator',
  'Button',
  'Checkbox',
  'Heading',
  'Icon',
  'IconIndicator',
  'Image',
  'InlineLink',
  'Link',
  'Loading',
  'ProgressBar',
  'RadioButton',
  'ShapeIndicator',
  'Skeleton',
  'Slider',
  'Tag',
  'Text',
  'TextArea',
  'TextInput',
  'Toggle',
  'View'
];

const MOLECULES = [
  'AILabelActions',
  'AILabelContent',
  'AISkeletonIcon',
  'AISkeletonPlaceholder',
  'AISkeletonText',
  'AccordionItem',
  'ActionableNotification',
  'BottomNavigationBar',
  'BottomSafeAreaColorOverride',
  'BottomToolbar',
  'BottomToolbarPrimaryAction',
  'BreadcrumbItem',
  'ButtonSet',
  'Callout',
  'ClickableTile',
  'CodeSnippet',
  'Column',
  'ColumnHang',
  'ContainedList',
  'ContainedListItem',
  'Content',
  'ControlledPasswordInput',
  'Copy',
  'CopyButton',
  'DataTable',
  'DataTableCell',
  'DataTableHeader',
  'DataTableHeaderSelected',
  'DatePickerInput',
  'DefinitionTooltip',
  'DismissibleTag',
  'DocumentViewer',
  'Dropdown',
  'ErrorBoundaryContext',
  'ErrorState',
  'ExpandableSearch',
  'ExpandableTile',
  'FileUploaderButton',
  'FileUploaderDropContainer',
  'FileUploaderItem',
  'Filename',
  'FlexGrid',
  'Form',
  'FormContext',
  'FormItem',
  'FormLabel',
  'GlobalTheme',
  'GrantPermission',
  'Grid',
  'GridSettings',
  'HStack',
  'HeaderContainer',
  'HeaderGlobalAction',
  'HeaderGlobalBar',
  'HeaderMenu',
  'HeaderMenuButton',
  'HeaderMenuItem',
  'HeaderName',
  'HeaderNavigation',
  'HeaderPanel',
  'HeaderSideNavItems',
  'IconButton',
  'IconSwitch',
  'IconTab',
  'InlineLoading',
  'InlineNotification',
  'LandingView',
  'List',
  'ListItem',
  'MenuItem',
  'MenuItemDivider',
  'MenuItemGroup',
  'MenuItemSelectable',
  'Modal',
  'ModalBody',
  'ModalFooter',
  'ModalHeader',
  'NavigationList',
  'NavigationListItem',
  'Notification',
  'NotificationActionButton',
  'NotificationButton',
  'NumberInput',
  'OperationalTag',
  'OrderedList',
  'OverflowMenuItem',
  'PaginationNav',
  'PasswordInput',
  'Popover',
  'PopoverContent',
  'PrefixContext',
  'ProgressStep',
  'RadioTile',
  'Row',
  'SafeAreaWrapper',
  'Search',
  'Section',
  'SelectItem',
  'SelectItemGroup',
  'SelectableTag',
  'SelectableTile',
  'SideNav',
  'SideNavDetails',
  'SideNavDivider',
  'SideNavFooter',
  'SideNavHeader',
  'SideNavIcon',
  'SideNavItem',
  'SideNavItems',
  'SideNavLink',
  'SideNavLinkText',
  'SideNavMenu',
  'SideNavMenuItem',
  'SideNavSwitcher',
  'SkeletonIcon',
  'SkeletonPlaceholder',
  'SkeletonText',
  'SkipToContent',
  'Stack',
  'StaticNotification',
  'StructuredListBody',
  'StructuredListCell',
  'StructuredListHead',
  'StructuredListInput',
  'StructuredListRow',
  'StructuredListWrapper',
  'Switch',
  'Switcher',
  'SwitcherDivider',
  'SwitcherItem',
  'Tab',
  'TabContent',
  'TabList',
  'TabListVertical',
  'TabPanel',
  'TabPanels',
  'Table',
  'TableActionList',
  'TableBatchAction',
  'TableBatchActions',
  'TableBody',
  'TableCell',
  'TableContainer',
  'TableDecoratorRow',
  'TableExpandHeader',
  'TableExpandRow',
  'TableExpandedRow',
  'TableHead',
  'TableHeader',
  'TableRow',
  'TableSelectAll',
  'TableSelectRow',
  'TableSlugRow',
  'TableToolbar',
  'TableToolbarAction',
  'TableToolbarContent',
  'TableToolbarMenu',
  'TableToolbarSearch',
  'ThemeContext',
  'Tile',
  'TileAboveTheFoldContent',
  'TileBelowTheFoldContent',
  'TileGroup',
  'TimePickerSelect',
  'ToastNotification',
  'Toggletip',
  'ToggletipActions',
  'ToggletipButton',
  'ToggletipContent',
  'Tooltip',
  'TopNavigationBar',
  'TopNavigationBarLogin',
  'TreeNode',
  'TruncatedText',
  'UiPanel',
  'UiPanelItem',
  'UnorderedList',
  'UserAvatar',
  'VStack',
  'ViewWrapper',
  'WebHeader'
];

const COMPOSITES = [
  'AILabel',
  'AcceptTerms',
  'Accordion',
  'ActionSheet',
  'Breadcrumb',
  'CheckboxGroup',
  'ComboBox',
  'ComboButton',
  'ComposedModal',
  'ContentSwitcher',
  'DataTableRow',
  'DateInput',
  'DatePicker',
  'FileUploader',
  'FilterableMultiSelect',
  'FormGroup',
  'Header',
  'Menu',
  'MenuButton',
  'MenuItemRadioGroup',
  'MultiSelect',
  'OverflowMenu',
  'Pagination',
  'ProgressIndicator',
  'RadioButtonGroup',
  'Select',
  'SidePanel',
  'Tabs',
  'TabsVertical',
  'TimePicker',
  'ToggletipLabel',
  'TreeView'
];


// Pre-index the tier arrays for O(1) lookup.
const TIER_INDEX = {};
ATOMS.forEach(function (k) {
  // Assign the atom tier to each component name
  TIER_INDEX[k] = 'atom';
});
MOLECULES.forEach(function (k) {
  // Assign the molecule tier to each component name
  TIER_INDEX[k] = 'molecule';
});
COMPOSITES.forEach(function (k) {
  // Assign the composite tier to each component name
  TIER_INDEX[k] = 'composite';
});


// Bucket the live registry keys into tiers. Iterates Object.keys(Component)
// (the actual roster); the tier arrays only assign a bucket. Any live key not
// in the index lands in 'uncategorized' and is still returned - never dropped.
function classify (Component) {

  // Flatten the registry, excluding meta keys that are not components
  const flat = Object.keys(Component).filter(function (k) {
    // Exclude variant, freeform, and provider meta keys
    return ['variant', 'freeform', 'provider'].indexOf(k) === -1;
  });

  // Initialize empty buckets for each tier plus uncategorized
  const buckets = { atom: [], molecule: [], composite: [], uncategorized: [] };

  // Assign each live key to its tier bucket, defaulting to uncategorized
  flat.forEach(function (k) {
    const tier = TIER_INDEX[k] || 'uncategorized';
    buckets[tier].push(k);
  });

  // Return the bucketed classification of the live registry
  return buckets;
}


export default {
  ATOMS: ATOMS,
  MOLECULES: MOLECULES,
  COMPOSITES: COMPOSITES,
  classify: classify
};
