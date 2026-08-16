// Info: Atom gallery. Each atom gets a dedicated full-width row showing
// multiple states (default, disabled, variants, sizes). The roster is
// registry-driven — add a new atom to the package and it appears here.
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Pressable, StyleSheet, Text as RNText } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
import SafeSample from './SafeSample';


const noop = function () {};


// One labelled state cell within an atom row
function StateCell ({ label, children }) {
  return (
    <View style={cellStyles.cell}>
      <RNText style={cellStyles.stateLabel}>{label}</RNText>
      <View style={cellStyles.stage}>
        <SafeSample name={label}>{children}</SafeSample>
      </View>
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: { gap: 4, alignItems: 'flex-start', minWidth: 100 },
  stateLabel: { fontSize: 10, color: '#8d8d8d', textTransform: 'uppercase', letterSpacing: 0.5 },
  stage: { minHeight: 20 }
});


// Full-width row for one atom with multiple state cells
function AtomRow ({ name, children }) {
  return (
    <View style={rowStyles.row}>
      <RNText style={rowStyles.name}>{name}</RNText>
      <View style={rowStyles.states}>{children}</View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    gap: 10
  },
  name: { fontSize: 13, fontWeight: '600', color: '#393939' },
  states: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }
});


// Stateful toggle row
function ToggleRow ({ C }) {
  const [on, setOn] = useState(false);
  return (
    <AtomRow name="Toggle">
      <StateCell label="off"><C.Toggle value={on} onValueChange={setOn} /></StateCell>
      <StateCell label="on"><C.Toggle value={true} onValueChange={noop} /></StateCell>
      <StateCell label="disabled off"><C.Toggle value={false} onValueChange={noop} disabled /></StateCell>
      <StateCell label="disabled on"><C.Toggle value={true} onValueChange={noop} disabled /></StateCell>
    </AtomRow>
  );
}

// Stateful checkbox row
function CheckboxRow ({ C }) {
  const [checked, setChecked] = useState(false);
  const toggle = useCallback(function () {
    setChecked(function (c) {
      return !c;
    });
  }, []);
  return (
    <AtomRow name="Checkbox">
      <StateCell label="interactive"><C.Checkbox checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="checked"><C.Checkbox checked={true} onChange={noop} /></StateCell>
      <StateCell label="unchecked"><C.Checkbox checked={false} onChange={noop} /></StateCell>
      <StateCell label="mixed"><C.Checkbox checked="mixed" onChange={noop} /></StateCell>
      <StateCell label="disabled"><C.Checkbox checked={true} onChange={noop} disabled /></StateCell>
    </AtomRow>
  );
}

// Stateful radio button row
function RadioButtonRow ({ C }) {
  const [checked, setChecked] = useState(false);
  const toggle = useCallback(function () {
    setChecked(function (c) {
      return !c;
    });
  }, []);
  return (
    <AtomRow name="RadioButton">
      <StateCell label="interactive"><C.RadioButton checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="selected"><C.RadioButton checked={true} onChange={noop} /></StateCell>
      <StateCell label="unselected"><C.RadioButton checked={false} onChange={noop} /></StateCell>
      <StateCell label="disabled"><C.RadioButton checked={true} onChange={noop} disabled /></StateCell>
    </AtomRow>
  );
}

// Stateful slider row
function SliderRow ({ C }) {
  const [val, setVal] = useState(50);
  return (
    <AtomRow name="Slider">
      <StateCell label="interactive">
        <View style={{ width: 200 }}><C.Slider value={val} onChange={setVal} /></View>
      </StateCell>
      <StateCell label="with input">
        <View style={{ width: 260 }}><C.Slider value={75} onChange={noop} hideTextInput={false} /></View>
      </StateCell>
      <StateCell label="disabled">
        <View style={{ width: 160 }}><C.Slider value={30} onChange={noop} disabled /></View>
      </StateCell>
    </AtomRow>
  );
}

// Stateful text input row
function TextInputRow ({ C }) {
  const [val, setVal] = useState('');
  return (
    <AtomRow name="TextInput">
      <StateCell label="default">
        <C.TextInput value={val} onChangeText={setVal} placeholder="Type here..." style={{ width: 180 }} />
      </StateCell>
      <StateCell label="invalid">
        <C.TextInput value="Bad value" onChangeText={noop} isInvalid style={{ width: 150 }} />
      </StateCell>
      <StateCell label="disabled">
        <C.TextInput value="Read only" onChangeText={noop} isDisabled style={{ width: 150 }} />
      </StateCell>
    </AtomRow>
  );
}

// Stateful text area row
function TextAreaRow ({ C }) {
  const [val, setVal] = useState('');
  return (
    <AtomRow name="TextArea">
      <StateCell label="default">
        <C.TextArea value={val} onChange={setVal} placeholder="Enter text..." rows={2} style={{ width: 200 }} />
      </StateCell>
      <StateCell label="invalid">
        <C.TextArea value="Bad content" onChange={noop} invalid rows={2} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="disabled">
        <C.TextArea value="Disabled" onChange={noop} disabled rows={2} style={{ width: 180 }} />
      </StateCell>
    </AtomRow>
  );
}


export default function AtomGallery () {

  const Lib = useLib();
  const { Link } = Lib.Navigation;
  const C = Lib.ThemeContext.useComponents();
  const reg = useShowcaseRegistry();

  if (!reg) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Atoms ({reg.buckets.atom.length})</C.Text>
      <C.Text color="text_secondary">Each atom with its visual states.</C.Text>

      {/* Button */}
      <AtomRow name="Button">
        <StateCell label="primary"><C.Button kind="primary" onPress={noop}>Primary</C.Button></StateCell>
        <StateCell label="secondary"><C.Button kind="secondary" onPress={noop}>Secondary</C.Button></StateCell>
        <StateCell label="danger"><C.Button kind="danger" onPress={noop}>Danger</C.Button></StateCell>
        <StateCell label="ghost"><C.Button kind="ghost" onPress={noop}>Ghost</C.Button></StateCell>
        <StateCell label="disabled"><C.Button kind="primary" onPress={noop} disabled>Disabled</C.Button></StateCell>
      </AtomRow>

      {/* Text */}
      <AtomRow name="Text">
        <StateCell label="xs"><C.Text size="xs">Extra small</C.Text></StateCell>
        <StateCell label="sm"><C.Text size="sm">Small</C.Text></StateCell>
        <StateCell label="md"><C.Text size="md">Medium</C.Text></StateCell>
        <StateCell label="lg"><C.Text size="lg">Large</C.Text></StateCell>
        <StateCell label="bold"><C.Text weight="bold">Bold</C.Text></StateCell>
        <StateCell label="muted"><C.Text color="text_muted">Muted</C.Text></StateCell>
        <StateCell label="primary color"><C.Text color="app_primary">Primary</C.Text></StateCell>
      </AtomRow>

      {/* Heading */}
      <AtomRow name="Heading">
        <StateCell label="h1"><C.Heading level={1}>Heading 1</C.Heading></StateCell>
        <StateCell label="h2"><C.Heading level={2}>Heading 2</C.Heading></StateCell>
        <StateCell label="h3"><C.Heading level={3}>Heading 3</C.Heading></StateCell>
        <StateCell label="h4"><C.Heading level={4}>Heading 4</C.Heading></StateCell>
      </AtomRow>

      {/* Icon */}
      <AtomRow name="Icon">
        <StateCell label="default"><C.Icon name="add" size="md" /></StateCell>
        <StateCell label="small"><C.Icon name="chevron-forward" size="sm" /></StateCell>
        <StateCell label="large"><C.Icon name="close" size="lg" /></StateCell>
        <StateCell label="primary"><C.Icon name="heart" size="md" color="APP_PRIMARY" /></StateCell>
        <StateCell label="danger"><C.Icon name="alert-circle" size="md" color="STATUS_DANGER" /></StateCell>
      </AtomRow>

      {/* Link */}
      <AtomRow name="Link">
        <StateCell label="default"><C.Link onPress={noop}>Click me</C.Link></StateCell>
        <StateCell label="disabled"><C.Link onPress={noop} disabled>Disabled</C.Link></StateCell>
      </AtomRow>

      {/* InlineLink */}
      <AtomRow name="InlineLink">
        <StateCell label="default"><C.InlineLink onPress={noop} title="Learn more" /></StateCell>
        <StateCell label="disabled"><C.InlineLink onPress={noop} title="Disabled" disabled /></StateCell>
      </AtomRow>

      {/* Toggle */}
      <ToggleRow C={C} />

      {/* Checkbox */}
      <CheckboxRow C={C} />

      {/* RadioButton */}
      <RadioButtonRow C={C} />

      {/* Slider */}
      <SliderRow C={C} />

      {/* TextInput */}
      <TextInputRow C={C} />

      {/* TextArea */}
      <TextAreaRow C={C} />

      {/* ProgressBar */}
      <AtomRow name="ProgressBar">
        <StateCell label="60%">
          <View style={{ width: 200 }}><C.ProgressBar value={0.6} /></View>
        </StateCell>
        <StateCell label="25%">
          <View style={{ width: 200 }}><C.ProgressBar value={0.25} /></View>
        </StateCell>
        <StateCell label="100%">
          <View style={{ width: 200 }}><C.ProgressBar value={1} /></View>
        </StateCell>
      </AtomRow>

      {/* Tag */}
      <AtomRow name="Tag">
        <StateCell label="default"><C.Tag label="Default" /></StateCell>
        <StateCell label="operational"><C.Tag label="Operational" variant="operational" /></StateCell>
        <StateCell label="dismissible"><C.Tag label="Dismiss" onDismiss={noop} /></StateCell>
        <StateCell label="disabled"><C.Tag label="Disabled" disabled /></StateCell>
      </AtomRow>

      {/* Skeleton */}
      <AtomRow name="Skeleton">
        <StateCell label="text">
          <C.Skeleton variant="text" width={120} />
        </StateCell>
        <StateCell label="text 3 lines">
          <C.Skeleton variant="text" width={160} lines={3} />
        </StateCell>
        <StateCell label="placeholder">
          <C.Skeleton variant="placeholder" width={80} height={40} />
        </StateCell>
        <StateCell label="icon">
          <C.Skeleton variant="icon" />
        </StateCell>
      </AtomRow>

      {/* Loading */}
      <AtomRow name="Loading">
        <StateCell label="small"><C.Loading size="sm" label="Loading" /></StateCell>
        <StateCell label="large"><C.Loading size="lg" label="Loading" /></StateCell>
      </AtomRow>

      {/* Image */}
      <AtomRow name="Image">
        <StateCell label="with placeholder">
          <C.Image source={{ uri: 'https://picsum.photos/80/80' }} style={{ width: 80, height: 80 }} radius="md" />
        </StateCell>
        <StateCell label="rounded">
          <C.Image source={{ uri: 'https://picsum.photos/60/60' }} style={{ width: 60, height: 60 }} radius="pill" />
        </StateCell>
      </AtomRow>

      {/* View */}
      <AtomRow name="View">
        <StateCell label="with border">
          <C.View border style={{ width: 80, height: 40 }} />
        </StateCell>
        <StateCell label="with background">
          <C.View background="app_primary" radius="md" style={{ width: 80, height: 40 }} />
        </StateCell>
      </AtomRow>

      {/* AspectRatio */}
      <AtomRow name="AspectRatio">
        <StateCell label="1:1">
          <C.AspectRatio ratio={1} style={{ width: 60 }}>
            <C.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </C.AspectRatio>
        </StateCell>
        <StateCell label="16:9">
          <C.AspectRatio ratio={16 / 9} style={{ width: 96 }}>
            <C.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </C.AspectRatio>
        </StateCell>
      </AtomRow>

      {/* BadgeIndicator */}
      <AtomRow name="BadgeIndicator">
        <StateCell label="count 5"><C.BadgeIndicator count={5} /></StateCell>
        <StateCell label="count 99+"><C.BadgeIndicator count={150} /></StateCell>
        <StateCell label="count 0"><C.BadgeIndicator count={0} /></StateCell>
      </AtomRow>

      {/* ShapeIndicator */}
      <AtomRow name="ShapeIndicator">
        <StateCell label="circle"><C.ShapeIndicator shape="circle" size={16} /></StateCell>
        <StateCell label="square"><C.ShapeIndicator shape="square" size={16} /></StateCell>
        <StateCell label="triangle"><C.ShapeIndicator shape="triangle" size={16} /></StateCell>
        <StateCell label="large"><C.ShapeIndicator shape="circle" size={24} color="STATUS_DANGER" /></StateCell>
      </AtomRow>

      {/* IconIndicator */}
      <AtomRow name="IconIndicator">
        <StateCell label="info"><C.IconIndicator iconName="information-circle" /></StateCell>
        <StateCell label="alert"><C.IconIndicator iconName="alert-circle" color="STATUS_DANGER" /></StateCell>
        <StateCell label="large"><C.IconIndicator iconName="checkmark-circle" size={32} /></StateCell>
      </AtomRow>

      <Link href="/showcase" asChild>
        <Pressable style={styles.back}>
          <C.Text color="app_primary" weight="medium">Back to showcase</C.Text>
        </Pressable>
      </Link>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, maxWidth: 960, width: '100%', alignSelf: 'center' },
  back: { alignItems: 'center', paddingVertical: 12 }
});
