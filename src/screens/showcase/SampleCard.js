// Info: One registry component rendered in a labelled, error-isolated card.
// The name is always shown; the component itself is mounted inside SafeSample
// with minimal props so a component that needs specific props/children to
// render degrades to a neutral fallback instead of crashing the gallery.
//
// Interactive components (Toggle, Slider, Checkbox, etc.) are wrapped with
// local state so they respond to user input in the showcase.
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SafeSample from './SafeSample';

// Render-hint props sourced from the package. One source, two consumers
// (tests and showcase). See _test/harness/props.js in the components package.
const HINT_PROPS = require('@superloomdev/rnw-components-carbon/data/hint-props');


// Components whose value prop is boolean, toggled via onValueChange
const BOOLEAN_TOGGLE = { Toggle: true, Switch: true };

// Components whose checked prop is boolean, toggled via onChange
const BOOLEAN_CHECK = { Checkbox: true, RadioButton: true };

// Components whose value is numeric, changed via onChange
const NUMERIC_RANGE = { Slider: true };

// Components whose value is text, changed via onChangeText
const TEXT_INPUT = { TextInput: true, TextArea: true, Search: true, ExpandableSearch: true, PasswordInput: true };


function InteractiveSample ({ name, Comp, hint }) {

  // Boolean toggle state (Toggle, Switch)
  const [boolVal, setBoolVal] = useState(hint && hint.value !== undefined ? !!hint.value : true);

  // Boolean checked state (Checkbox, RadioButton)
  const [checked, setChecked] = useState(hint && hint.checked !== undefined ? !!hint.checked : false);

  // Numeric range state (Slider)
  const [numVal, setNumVal] = useState(hint && typeof hint.value === 'number' ? hint.value : 50);

  // Text input state
  const [textVal, setTextVal] = useState(hint && typeof hint.value === 'string' ? hint.value : '');

  const onBoolChange = useCallback(function (v) {
    setBoolVal(v);
  }, []);
  const onCheckedChange = useCallback(function () {
    setChecked(function (c) {
      return !c;
    });
  }, []);
  const onNumChange = useCallback(function (v) {
    setNumVal(v);
  }, []);
  const onTextChange = useCallback(function (v) {
    setTextVal(v);
  }, []);

  if (BOOLEAN_TOGGLE[name]) {
    const merged = Object.assign({}, hint, { value: boolVal, onValueChange: onBoolChange });
    return <Comp {...merged} />;
  }

  if (BOOLEAN_CHECK[name]) {
    const merged = Object.assign({}, hint, { checked: checked, onChange: onCheckedChange });
    return <Comp {...merged} />;
  }

  if (NUMERIC_RANGE[name]) {
    const merged = Object.assign({}, hint, { value: numVal, onChange: onNumChange });
    return <Comp {...merged} />;
  }

  if (TEXT_INPUT[name]) {
    const merged = Object.assign({}, hint, { value: textVal, onChangeText: onTextChange });
    return <Comp {...merged} />;
  }

  // Non-interactive: render with static hint props
  return <Comp {...hint} />;

}


export default function SampleCard ({ name, Component }) {

  const Comp = Component[name];
  const hint = HINT_PROPS[name] || null;

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>{name}</Text>
      <View style={styles.stage}>
        <SafeSample name={name}>
          {Comp
            ? <InteractiveSample name={name} Comp={Comp} hint={hint} />
            : <Text style={styles.missing}>not in registry</Text>}
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
