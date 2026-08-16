// Info: Atom gallery. Each atom gets a dedicated full-width row showing
// multiple states (default, disabled, variants, sizes). The roster is
// registry-driven - add a new atom to the package and it appears here.
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

const { useLib } = require('../../app-core/contexts/lib-context');
import useShowcaseRegistry from './useShowcaseRegistry';
const { ShowcaseRow, StateCell } = require('./ShowcaseRow');


const noop = function () {};


// Stateful toggle row
function ToggleRow ({ C }) {
  const [on, setOn] = useState(false);
  return (
    <ShowcaseRow name="Toggle" C={C}>
      <StateCell label="interactive" C={C}><C.Toggle value={on} onValueChange={setOn} /></StateCell>
      <StateCell label="on" C={C}><C.Toggle value={true} onValueChange={noop} /></StateCell>
      <StateCell label="disabled off" C={C}><C.Toggle value={false} onValueChange={noop} disabled /></StateCell>
      <StateCell label="disabled on" C={C}><C.Toggle value={true} onValueChange={noop} disabled /></StateCell>
    </ShowcaseRow>
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
    <ShowcaseRow name="Checkbox" C={C}>
      <StateCell label="interactive" C={C}><C.Checkbox checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="checked" C={C}><C.Checkbox checked={true} onChange={noop} /></StateCell>
      <StateCell label="unchecked" C={C}><C.Checkbox checked={false} onChange={noop} /></StateCell>
      <StateCell label="mixed" C={C}><C.Checkbox checked="mixed" onChange={noop} /></StateCell>
      <StateCell label="disabled" C={C}><C.Checkbox checked={true} onChange={noop} disabled /></StateCell>
    </ShowcaseRow>
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
    <ShowcaseRow name="RadioButton" C={C}>
      <StateCell label="interactive" C={C}><C.RadioButton checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="selected" C={C}><C.RadioButton checked={true} onChange={noop} /></StateCell>
      <StateCell label="unselected" C={C}><C.RadioButton checked={false} onChange={noop} /></StateCell>
      <StateCell label="disabled" C={C}><C.RadioButton checked={true} onChange={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

// Stateful slider row
function SliderRow ({ C }) {
  const [val, setVal] = useState(50);
  return (
    <ShowcaseRow name="Slider" C={C}>
      <StateCell label="interactive" C={C}>
        <View style={{ width: 200 }}><C.Slider value={val} onChange={setVal} /></View>
      </StateCell>
      <StateCell label="with input" C={C}>
        <View style={{ width: 260 }}><C.Slider value={75} onChange={noop} hideTextInput={false} /></View>
      </StateCell>
      <StateCell label="disabled" C={C}>
        <View style={{ width: 160 }}><C.Slider value={30} onChange={noop} disabled /></View>
      </StateCell>
    </ShowcaseRow>
  );
}

// Stateful text input row
function TextInputRow ({ C }) {
  const [val, setVal] = useState('');
  return (
    <ShowcaseRow name="TextInput" C={C}>
      <StateCell label="default" C={C}>
        <C.TextInput value={val} onChangeText={setVal} placeholder="Type here..." style={{ width: 180 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <C.TextInput value="Hello world" onChangeText={noop} style={{ width: 150 }} />
      </StateCell>
      <StateCell label="invalid" C={C}>
        <C.TextInput value="Bad value" onChangeText={noop} isInvalid style={{ width: 150 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <C.TextInput value="Read only" onChangeText={noop} isDisabled style={{ width: 150 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

// Stateful text area row
function TextAreaRow ({ C }) {
  const [val, setVal] = useState('');
  return (
    <ShowcaseRow name="TextArea" C={C}>
      <StateCell label="default" C={C}>
        <C.TextArea value={val} onChange={setVal} placeholder="Enter text..." rows={2} style={{ width: 200 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <C.TextArea value="Some content here" onChange={noop} rows={2} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="invalid" C={C}>
        <C.TextArea value="Bad content" onChange={noop} invalid rows={2} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <C.TextArea value="Disabled" onChange={noop} disabled rows={2} style={{ width: 180 }} />
      </StateCell>
    </ShowcaseRow>
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
      <ShowcaseRow name="Button" C={C}>
        <StateCell label="primary" C={C}><C.Button kind="primary" onPress={noop}>Primary</C.Button></StateCell>
        <StateCell label="secondary" C={C}><C.Button kind="secondary" onPress={noop}>Secondary</C.Button></StateCell>
        <StateCell label="danger" C={C}><C.Button kind="danger" onPress={noop}>Danger</C.Button></StateCell>
        <StateCell label="ghost" C={C}><C.Button kind="ghost" onPress={noop}>Ghost</C.Button></StateCell>
        <StateCell label="disabled" C={C}><C.Button kind="primary" onPress={noop} disabled>Disabled</C.Button></StateCell>
      </ShowcaseRow>

      {/* Text */}
      <ShowcaseRow name="Text" C={C}>
        <StateCell label="xs" C={C}><C.Text size="xs">Extra small</C.Text></StateCell>
        <StateCell label="sm" C={C}><C.Text size="sm">Small</C.Text></StateCell>
        <StateCell label="md" C={C}><C.Text size="md">Medium</C.Text></StateCell>
        <StateCell label="lg" C={C}><C.Text size="lg">Large</C.Text></StateCell>
        <StateCell label="bold" C={C}><C.Text weight="bold">Bold</C.Text></StateCell>
        <StateCell label="muted" C={C}><C.Text color="text_muted">Muted</C.Text></StateCell>
        <StateCell label="primary color" C={C}><C.Text color="app_primary">Primary</C.Text></StateCell>
      </ShowcaseRow>

      {/* Heading */}
      <ShowcaseRow name="Heading" C={C}>
        <StateCell label="h1" C={C}><C.Heading level={1}>Heading 1</C.Heading></StateCell>
        <StateCell label="h2" C={C}><C.Heading level={2}>Heading 2</C.Heading></StateCell>
        <StateCell label="h3" C={C}><C.Heading level={3}>Heading 3</C.Heading></StateCell>
        <StateCell label="h4" C={C}><C.Heading level={4}>Heading 4</C.Heading></StateCell>
      </ShowcaseRow>

      {/* Icon */}
      <ShowcaseRow name="Icon" C={C}>
        <StateCell label="default" C={C}><C.Icon name="add" size="md" /></StateCell>
        <StateCell label="small" C={C}><C.Icon name="chevron-forward" size="sm" /></StateCell>
        <StateCell label="large" C={C}><C.Icon name="close" size="lg" /></StateCell>
        <StateCell label="primary" C={C}><C.Icon name="heart" size="md" color="APP_PRIMARY" /></StateCell>
        <StateCell label="danger" C={C}><C.Icon name="alert-circle" size="md" color="STATUS_DANGER" /></StateCell>
      </ShowcaseRow>

      {/* Link */}
      <ShowcaseRow name="Link" C={C}>
        <StateCell label="default" C={C}><C.Link onPress={noop}>Click me</C.Link></StateCell>
        <StateCell label="disabled" C={C}><C.Link onPress={noop} disabled>Disabled</C.Link></StateCell>
      </ShowcaseRow>

      {/* InlineLink */}
      <ShowcaseRow name="InlineLink" C={C}>
        <StateCell label="default" C={C}><C.InlineLink onPress={noop} title="Learn more" /></StateCell>
        <StateCell label="disabled" C={C}><C.InlineLink onPress={noop} title="Disabled" disabled /></StateCell>
      </ShowcaseRow>

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
      <ShowcaseRow name="ProgressBar" C={C}>
        <StateCell label="25%" C={C}>
          <View style={{ width: 200 }}><C.ProgressBar value={0.25} /></View>
        </StateCell>
        <StateCell label="60%" C={C}>
          <View style={{ width: 200 }}><C.ProgressBar value={0.6} /></View>
        </StateCell>
        <StateCell label="100%" C={C}>
          <View style={{ width: 200 }}><C.ProgressBar value={1} /></View>
        </StateCell>
      </ShowcaseRow>

      {/* Tag */}
      <ShowcaseRow name="Tag" C={C}>
        <StateCell label="default" C={C}><C.Tag label="Default" /></StateCell>
        <StateCell label="operational" C={C}><C.Tag label="Operational" variant="operational" /></StateCell>
        <StateCell label="dismissible" C={C}><C.Tag label="Dismiss" onDismiss={noop} /></StateCell>
        <StateCell label="disabled" C={C}><C.Tag label="Disabled" disabled /></StateCell>
      </ShowcaseRow>

      {/* Skeleton */}
      <ShowcaseRow name="Skeleton" C={C}>
        <StateCell label="text" C={C}>
          <C.Skeleton variant="text" width={120} />
        </StateCell>
        <StateCell label="text 3 lines" C={C}>
          <C.Skeleton variant="text" width={160} lines={3} />
        </StateCell>
        <StateCell label="placeholder" C={C}>
          <C.Skeleton variant="placeholder" width={80} height={40} />
        </StateCell>
        <StateCell label="icon" C={C}>
          <C.Skeleton variant="icon" />
        </StateCell>
      </ShowcaseRow>

      {/* Loading */}
      <ShowcaseRow name="Loading" C={C}>
        <StateCell label="small" C={C}><C.Loading size="sm" label="Loading" /></StateCell>
        <StateCell label="large" C={C}><C.Loading size="lg" label="Loading" /></StateCell>
      </ShowcaseRow>

      {/* Image */}
      <ShowcaseRow name="Image" C={C}>
        <StateCell label="with placeholder" C={C}>
          <C.Image source={{ uri: 'https://picsum.photos/80/80' }} style={{ width: 80, height: 80 }} radius="md" />
        </StateCell>
        <StateCell label="rounded" C={C}>
          <C.Image source={{ uri: 'https://picsum.photos/60/60' }} style={{ width: 60, height: 60 }} radius="pill" />
        </StateCell>
      </ShowcaseRow>

      {/* View */}
      <ShowcaseRow name="View" C={C}>
        <StateCell label="with border" C={C}>
          <C.View border style={{ width: 80, height: 40 }} />
        </StateCell>
        <StateCell label="with background" C={C}>
          <C.View background="app_primary" radius="md" style={{ width: 80, height: 40 }} />
        </StateCell>
      </ShowcaseRow>

      {/* AspectRatio */}
      <ShowcaseRow name="AspectRatio" C={C}>
        <StateCell label="1:1" C={C}>
          <C.AspectRatio ratio={1} style={{ width: 60 }}>
            <C.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </C.AspectRatio>
        </StateCell>
        <StateCell label="16:9" C={C}>
          <C.AspectRatio ratio={16 / 9} style={{ width: 96 }}>
            <C.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </C.AspectRatio>
        </StateCell>
      </ShowcaseRow>

      {/* BadgeIndicator */}
      <ShowcaseRow name="BadgeIndicator" C={C}>
        <StateCell label="count 5" C={C}><C.BadgeIndicator count={5} /></StateCell>
        <StateCell label="count 99+" C={C}><C.BadgeIndicator count={150} /></StateCell>
        <StateCell label="count 0" C={C}><C.BadgeIndicator count={0} /></StateCell>
      </ShowcaseRow>

      {/* ShapeIndicator */}
      <ShowcaseRow name="ShapeIndicator" C={C}>
        <StateCell label="circle" C={C}><C.ShapeIndicator shape="circle" size={16} /></StateCell>
        <StateCell label="square" C={C}><C.ShapeIndicator shape="square" size={16} /></StateCell>
        <StateCell label="triangle" C={C}><C.ShapeIndicator shape="triangle" size={16} /></StateCell>
        <StateCell label="large" C={C}><C.ShapeIndicator shape="circle" size={24} color="STATUS_DANGER" /></StateCell>
      </ShowcaseRow>

      {/* IconIndicator */}
      <ShowcaseRow name="IconIndicator" C={C}>
        <StateCell label="info" C={C}><C.IconIndicator iconName="information-circle" /></StateCell>
        <StateCell label="alert" C={C}><C.IconIndicator iconName="alert-circle" color="STATUS_DANGER" /></StateCell>
        <StateCell label="large" C={C}><C.IconIndicator iconName="checkmark-circle" size={32} /></StateCell>
      </ShowcaseRow>

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
