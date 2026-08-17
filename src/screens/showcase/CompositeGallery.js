// Info: Composite gallery. Each composite gets a dedicated full-width row
// showing multiple visual states. Composites coordinate children through
// compound contexts (Tabs, Accordion, Menu, etc.). Each renders in an
// error-isolated cell; composites that need specific child shapes degrade
// to a neutral fallback.
import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
const { ShowcaseRow, StateCell } = require('./ShowcaseRow');
import SafeSample from './SafeSample';


const noop = function () {};


// ---- Custom interactive composite rows ----

function CheckboxGroupRow ({ C, R }) {
  const [selected, setSelected] = useState(['a']);
  const toggle = useCallback(function (val) {
    setSelected(function (prev) {
      if (prev.indexOf(val) >= 0) {
        return prev.filter(function (v) {
          return v !== val;
        });
      }
      return prev.concat([val]);
    });
  }, []);
  return (
    <ShowcaseRow name="CheckboxGroup" C={C}>
      <StateCell label="interactive" C={C}>
        <SafeSample name="CheckboxGroup">
          <R.CheckboxGroup selected={selected} onChange={toggle}>
            <R.Checkbox value="a" label="Option A" />
            <R.Checkbox value="b" label="Option B" />
            <R.Checkbox value="c" label="Option C" />
          </R.CheckboxGroup>
        </SafeSample>
      </StateCell>
    </ShowcaseRow>
  );
}

function RadioButtonGroupRow ({ C, R }) {
  const [val, setVal] = useState('a');
  return (
    <ShowcaseRow name="RadioButtonGroup" C={C}>
      <StateCell label="interactive" C={C}>
        <SafeSample name="RadioButtonGroup">
          <R.RadioButtonGroup value={val} onChange={setVal}>
            <R.RadioButton value="a" label="Option A" />
            <R.RadioButton value="b" label="Option B" />
            <R.RadioButton value="c" label="Option C" />
          </R.RadioButtonGroup>
        </SafeSample>
      </StateCell>
    </ShowcaseRow>
  );
}


// ---- Static multi-state definitions ----

const MULTI_STATE = {
  Accordion: [
    { label: 'default', props: { children: 'Accordion' } }
  ],
  AcceptTerms: [
    { label: 'default', props: { children: 'I accept the terms and conditions' } }
  ],
  AILabel: [
    { label: 'default', props: {} }
  ],
  Breadcrumb: [
    { label: 'default', props: { children: 'Breadcrumb' } }
  ],
  ComboBox: [
    { label: 'default', props: { triggerLabel: 'Choose an item', items: [], onSelect: noop } }
  ],
  ComboButton: [
    { label: 'default', props: { children: 'ComboButton' } }
  ],
  ComposedModal: [
    { label: 'static preview', props: { children: 'Modal content', open: false } }
  ],
  ContentSwitcher: [
    { label: 'default', props: { children: 'Switcher' } }
  ],
  DataTableRow: [
    { label: 'default', props: { children: 'Row' } }
  ],
  DateInput: [
    { label: 'default', props: { placeholder: 'mm/dd/yyyy' } }
  ],
  DatePicker: [
    { label: 'default', props: { children: 'DatePicker' } }
  ],
  FileUploader: [
    { label: 'default', props: { children: 'FileUploader' } }
  ],
  FilterableMultiSelect: [
    { label: 'default', props: { triggerLabel: 'Filter items', items: [], onSelect: noop } }
  ],
  FormGroup: [
    { label: 'default', props: { children: 'FormGroup' } }
  ],
  Header: [
    { label: 'default', props: { children: 'Header' } }
  ],
  Menu: [
    { label: 'default', props: { children: 'Menu' } }
  ],
  MenuButton: [
    { label: 'default', props: { children: 'MenuButton' } }
  ],
  MenuItemRadioGroup: [
    { label: 'default', props: { children: 'RadioGroup' } }
  ],
  MultiSelect: [
    { label: 'default', props: { triggerLabel: 'Select items', items: [], onSelect: noop } }
  ],
  OverflowMenu: [
    { label: 'default', props: { children: 'OverflowMenu' } }
  ],
  Pagination: [
    { label: 'default', props: { totalItems: 100, pageSize: 10 } }
  ],
  ProgressIndicator: [
    { label: 'default', props: { children: 'ProgressIndicator' } }
  ],
  Select: [
    { label: 'default', props: { children: 'Select' } }
  ],
  SidePanel: [
    { label: 'static preview', props: { children: 'SidePanel', open: false } }
  ],
  Tabs: [
    { label: 'default', props: { children: 'Tabs' } }
  ],
  TabsVertical: [
    { label: 'default', props: { children: 'TabsVertical' } }
  ],
  TimePicker: [
    { label: 'default', props: { children: 'TimePicker' } }
  ],
  ToggletipLabel: [
    { label: 'default', props: { children: 'ToggletipLabel' } }
  ],
  TreeView: [
    { label: 'default', props: { children: 'TreeView' } }
  ],
  ActionSheet: [
    { label: 'default', props: { children: 'ActionSheet' } }
  ]
};

const CUSTOM_ROWS = {
  CheckboxGroup: true,
  RadioButtonGroup: true
};


// Multi-state row
function MultiStateCompositeRow ({ name, Comp, states, C }) {
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


export default function CompositeGallery () {

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
  const keys = reg.buckets.composite;

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Composites ({keys.length})</C.Text>
      <C.Text color="text_secondary">Multi-part components with parent-child coordination.</C.Text>

      {/* Custom interactive rows */}
      {R.CheckboxGroup ? <CheckboxGroupRow C={C} R={R} /> : null}
      {R.RadioButtonGroup ? <RadioButtonGroupRow C={C} R={R} /> : null}

      {/* All other composites in alphabetical order */}
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
          return <MultiStateCompositeRow key={k} name={k} Comp={Comp} states={states} C={C} />;
        }
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
