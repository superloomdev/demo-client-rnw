// Info: Atom gallery. Each atom gets a dedicated full-width row showing
// multiple states (default, disabled, variants, sizes). The roster is
// registry-driven - add a new atom to the package and it appears here.
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';

import { useLib } from '../../app-core/contexts/lib-context.js';
import useShowcaseRegistry from './useShowcaseRegistry.js';
import { ShowcaseRow, StateCell } from './ShowcaseRow.js';


const noop = function () {};


// Stateful toggle row (R = Carbon registry components)
function ToggleRow ({ C, R }) {
  // Track the interactive toggle's on/off state
  const [on, setOn] = useState(false);
  // Render the toggle row with interactive, static, and disabled states
  return (
    <ShowcaseRow name="Toggle" C={C}>
      <StateCell label="interactive" C={C}><R.Toggle value={on} onValueChange={setOn} /></StateCell>
      <StateCell label="on" C={C}><R.Toggle value={true} onValueChange={noop} /></StateCell>
      <StateCell label="disabled off" C={C}><R.Toggle value={false} onValueChange={noop} disabled /></StateCell>
      <StateCell label="disabled on" C={C}><R.Toggle value={true} onValueChange={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

// Stateful checkbox row
function CheckboxRow ({ C, R }) {
  // Track the interactive checkbox's checked state
  const [checked, setChecked] = useState(false);
  // Toggle the checked state when the interactive checkbox is pressed
  const toggle = useCallback(function () {
    setChecked(function (c) {
      // Flip the previous checked value
      return !c;
    });
  }, []);
  // Render the checkbox row with interactive, static, and disabled states
  return (
    <ShowcaseRow name="Checkbox" C={C}>
      <StateCell label="interactive" C={C}><R.Checkbox checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="checked" C={C}><R.Checkbox checked={true} onChange={noop} /></StateCell>
      <StateCell label="unchecked" C={C}><R.Checkbox checked={false} onChange={noop} /></StateCell>
      <StateCell label="mixed" C={C}><R.Checkbox checked="mixed" onChange={noop} /></StateCell>
      <StateCell label="disabled" C={C}><R.Checkbox checked={true} onChange={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

// Stateful radio button row
function RadioButtonRow ({ C, R }) {
  // Track the interactive radio button's checked state
  const [checked, setChecked] = useState(false);
  // Toggle the checked state when the interactive radio button is pressed
  const toggle = useCallback(function () {
    setChecked(function (c) {
      // Flip the previous checked value
      return !c;
    });
  }, []);
  // Render the radio button row with interactive, static, and disabled states
  return (
    <ShowcaseRow name="RadioButton" C={C}>
      <StateCell label="interactive" C={C}><R.RadioButton checked={checked} onChange={toggle} label="Option" /></StateCell>
      <StateCell label="selected" C={C}><R.RadioButton checked={true} onChange={noop} /></StateCell>
      <StateCell label="unselected" C={C}><R.RadioButton checked={false} onChange={noop} /></StateCell>
      <StateCell label="disabled" C={C}><R.RadioButton checked={true} onChange={noop} disabled /></StateCell>
    </ShowcaseRow>
  );
}

// Stateful slider row
function SliderRow ({ C, R }) {
  // Track the interactive slider's value
  const [val, setVal] = useState(50);
  // Render the slider row with interactive, input, and disabled states
  return (
    <ShowcaseRow name="Slider" C={C}>
      <StateCell label="interactive" C={C}>
        <View style={{ width: 200 }}><R.Slider value={val} onChange={setVal} /></View>
      </StateCell>
      <StateCell label="with input" C={C}>
        <View style={{ width: 260 }}><R.Slider value={75} onChange={noop} hideTextInput={false} /></View>
      </StateCell>
      <StateCell label="disabled" C={C}>
        <View style={{ width: 160 }}><R.Slider value={30} onChange={noop} disabled /></View>
      </StateCell>
    </ShowcaseRow>
  );
}

// Stateful text input row
function TextInputRow ({ C, R }) {
  // Track the interactive text input's value
  const [val, setVal] = useState('');
  // Render the text input row with default, filled, invalid, and disabled states
  return (
    <ShowcaseRow name="TextInput" C={C}>
      <StateCell label="default" C={C}>
        <R.TextInput value={val} onChangeText={setVal} placeholder="Type here..." style={{ width: 180 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <R.TextInput value="Hello world" onChangeText={noop} style={{ width: 150 }} />
      </StateCell>
      <StateCell label="invalid" C={C}>
        <R.TextInput value="Bad value" onChangeText={noop} isInvalid style={{ width: 150 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <R.TextInput value="Read only" onChangeText={noop} isDisabled style={{ width: 150 }} />
      </StateCell>
    </ShowcaseRow>
  );
}

// Stateful text area row
function TextAreaRow ({ C, R }) {
  // Track the interactive text area's value
  const [val, setVal] = useState('');
  // Render the text area row with default, filled, invalid, and disabled states
  return (
    <ShowcaseRow name="TextArea" C={C}>
      <StateCell label="default" C={C}>
        <R.TextArea value={val} onChange={setVal} placeholder="Enter text..." rows={2} style={{ width: 200 }} />
      </StateCell>
      <StateCell label="with text" C={C}>
        <R.TextArea value="Some content here" onChange={noop} rows={2} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="invalid" C={C}>
        <R.TextArea value="Bad content" onChange={noop} invalid rows={2} style={{ width: 180 }} />
      </StateCell>
      <StateCell label="disabled" C={C}>
        <R.TextArea value="Disabled" onChange={noop} disabled rows={2} style={{ width: 180 }} />
      </StateCell>
    </ShowcaseRow>
  );
}


export default function AtomGallery () {

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

  // Render the atom gallery with one row per atom showing multiple states
  return (
    <ScrollView contentContainerStyle={styles.content}>

      <C.Text size="lg" weight="semibold">Atoms ({reg.buckets.atom.length})</C.Text>
      <C.Text color="text_secondary">Each atom with its visual states.</C.Text>

      {/* Button */}
      <ShowcaseRow name="Button" C={C}>
        <StateCell label="primary" C={C}><R.Button kind="primary" onPress={noop}>Primary</R.Button></StateCell>
        <StateCell label="secondary" C={C}><R.Button kind="secondary" onPress={noop}>Secondary</R.Button></StateCell>
        <StateCell label="danger" C={C}><R.Button kind="danger" onPress={noop}>Danger</R.Button></StateCell>
        <StateCell label="ghost" C={C}><R.Button kind="ghost" onPress={noop}>Ghost</R.Button></StateCell>
        <StateCell label="disabled" C={C}><R.Button kind="primary" onPress={noop} disabled>Disabled</R.Button></StateCell>
      </ShowcaseRow>

      {/* Text */}
      <ShowcaseRow name="Text" C={C}>
        <StateCell label="xs" C={C}><R.Text size="xs">Extra small</R.Text></StateCell>
        <StateCell label="sm" C={C}><R.Text size="sm">Small</R.Text></StateCell>
        <StateCell label="md" C={C}><R.Text size="md">Medium</R.Text></StateCell>
        <StateCell label="lg" C={C}><R.Text size="lg">Large</R.Text></StateCell>
        <StateCell label="bold" C={C}><R.Text weight="bold">Bold</R.Text></StateCell>
        <StateCell label="muted" C={C}><R.Text color="text_muted">Muted</R.Text></StateCell>
        <StateCell label="primary color" C={C}><R.Text color="app_primary">Primary</R.Text></StateCell>
      </ShowcaseRow>

      {/* Heading */}
      <ShowcaseRow name="Heading" C={C}>
        <StateCell label="h1" C={C}><R.Heading level={1}>Heading 1</R.Heading></StateCell>
        <StateCell label="h2" C={C}><R.Heading level={2}>Heading 2</R.Heading></StateCell>
        <StateCell label="h3" C={C}><R.Heading level={3}>Heading 3</R.Heading></StateCell>
        <StateCell label="h4" C={C}><R.Heading level={4}>Heading 4</R.Heading></StateCell>
      </ShowcaseRow>

      {/* Icon */}
      <ShowcaseRow name="Icon" C={C}>
        <StateCell label="default" C={C}><R.Icon name="add" size="md" /></StateCell>
        <StateCell label="small" C={C}><R.Icon name="chevron-forward" size="sm" /></StateCell>
        <StateCell label="large" C={C}><R.Icon name="close" size="lg" /></StateCell>
        <StateCell label="primary" C={C}><R.Icon name="heart" size="md" color="APP_PRIMARY" /></StateCell>
        <StateCell label="danger" C={C}><R.Icon name="alert-circle" size="md" color="STATUS_DANGER" /></StateCell>
      </ShowcaseRow>

      {/* Link */}
      <ShowcaseRow name="Link" C={C}>
        <StateCell label="default" C={C}><R.Link onPress={noop}>Click me</R.Link></StateCell>
        <StateCell label="disabled" C={C}><R.Link onPress={noop} disabled>Disabled</R.Link></StateCell>
      </ShowcaseRow>

      {/* InlineLink */}
      <ShowcaseRow name="InlineLink" C={C}>
        <StateCell label="default" C={C}><R.InlineLink onPress={noop} title="Learn more" /></StateCell>
        <StateCell label="disabled" C={C}><R.InlineLink onPress={noop} title="Disabled" disabled /></StateCell>
      </ShowcaseRow>

      {/* Toggle */}
      <ToggleRow C={C} R={R} />

      {/* Checkbox */}
      <CheckboxRow C={C} R={R} />

      {/* RadioButton */}
      <RadioButtonRow C={C} R={R} />

      {/* Slider */}
      <SliderRow C={C} R={R} />

      {/* TextInput */}
      <TextInputRow C={C} R={R} />

      {/* TextArea */}
      <TextAreaRow C={C} R={R} />

      {/* ProgressBar */}
      <ShowcaseRow name="ProgressBar" C={C}>
        <StateCell label="25%" C={C}>
          <View style={{ width: 200 }}><R.ProgressBar value={0.25} /></View>
        </StateCell>
        <StateCell label="60%" C={C}>
          <View style={{ width: 200 }}><R.ProgressBar value={0.6} /></View>
        </StateCell>
        <StateCell label="100%" C={C}>
          <View style={{ width: 200 }}><R.ProgressBar value={1} /></View>
        </StateCell>
      </ShowcaseRow>

      {/* Tag */}
      <ShowcaseRow name="Tag" C={C}>
        <StateCell label="default" C={C}><R.Tag label="Default" /></StateCell>
        <StateCell label="operational" C={C}><R.Tag label="Operational" variant="operational" /></StateCell>
        <StateCell label="dismissible" C={C}><R.Tag label="Dismiss" onDismiss={noop} /></StateCell>
        <StateCell label="disabled" C={C}><R.Tag label="Disabled" disabled /></StateCell>
      </ShowcaseRow>

      {/* Skeleton */}
      <ShowcaseRow name="Skeleton" C={C}>
        <StateCell label="text" C={C}>
          <R.Skeleton variant="text" width={120} />
        </StateCell>
        <StateCell label="text 3 lines" C={C}>
          <R.Skeleton variant="text" width={160} lines={3} />
        </StateCell>
        <StateCell label="placeholder" C={C}>
          <R.Skeleton variant="placeholder" width={80} height={40} />
        </StateCell>
        <StateCell label="icon" C={C}>
          <R.Skeleton variant="icon" />
        </StateCell>
      </ShowcaseRow>

      {/* Loading */}
      <ShowcaseRow name="Loading" C={C}>
        <StateCell label="small" C={C}><R.Loading size="sm" label="Loading" /></StateCell>
        <StateCell label="large" C={C}><R.Loading size="lg" label="Loading" /></StateCell>
      </ShowcaseRow>

      {/* Image */}
      <ShowcaseRow name="Image" C={C}>
        <StateCell label="with placeholder" C={C}>
          <R.Image source={{ uri: 'https://picsum.photos/80/80' }} style={{ width: 80, height: 80 }} radius="md" />
        </StateCell>
        <StateCell label="rounded" C={C}>
          <R.Image source={{ uri: 'https://picsum.photos/60/60' }} style={{ width: 60, height: 60 }} radius="pill" />
        </StateCell>
      </ShowcaseRow>

      {/* View */}
      <ShowcaseRow name="View" C={C}>
        <StateCell label="with border" C={C}>
          <R.View border style={{ width: 80, height: 40 }} />
        </StateCell>
        <StateCell label="with background" C={C}>
          <R.View background="app_primary" radius="md" style={{ width: 80, height: 40 }} />
        </StateCell>
      </ShowcaseRow>

      {/* AspectRatio */}
      <ShowcaseRow name="AspectRatio" C={C}>
        <StateCell label="1:1" C={C}>
          <R.AspectRatio ratio={1} style={{ width: 60 }}>
            <R.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </R.AspectRatio>
        </StateCell>
        <StateCell label="16:9" C={C}>
          <R.AspectRatio ratio={16 / 9} style={{ width: 96 }}>
            <R.View background="app_primary" style={{ flex: 1 }} radius="sm" />
          </R.AspectRatio>
        </StateCell>
      </ShowcaseRow>

      {/* BadgeIndicator */}
      <ShowcaseRow name="BadgeIndicator" C={C}>
        <StateCell label="count 5" C={C}><R.BadgeIndicator count={5} /></StateCell>
        <StateCell label="count 99+" C={C}><R.BadgeIndicator count={150} /></StateCell>
        <StateCell label="count 0" C={C}><R.BadgeIndicator count={0} /></StateCell>
      </ShowcaseRow>

      {/* ShapeIndicator */}
      <ShowcaseRow name="ShapeIndicator" C={C}>
        <StateCell label="circle" C={C}><R.ShapeIndicator shape="circle" size={16} /></StateCell>
        <StateCell label="square" C={C}><R.ShapeIndicator shape="square" size={16} /></StateCell>
        <StateCell label="triangle" C={C}><R.ShapeIndicator shape="triangle" size={16} /></StateCell>
        <StateCell label="large" C={C}><R.ShapeIndicator shape="circle" size={24} color="STATUS_DANGER" /></StateCell>
      </ShowcaseRow>

      {/* IconIndicator */}
      <ShowcaseRow name="IconIndicator" C={C}>
        <StateCell label="info" C={C}><R.IconIndicator iconName="information-circle" /></StateCell>
        <StateCell label="alert" C={C}><R.IconIndicator iconName="alert-circle" color="STATUS_DANGER" /></StateCell>
        <StateCell label="large" C={C}><R.IconIndicator iconName="checkmark-circle" size={32} /></StateCell>
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
