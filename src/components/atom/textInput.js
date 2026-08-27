// Info: TextInput atom. A themed single-line input. Border/radius/padding/font all
// come from tokens; focus swaps the border to the primary color. Placeholder color
// uses a derived muted token so it reads consistently across shapes.
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';


export default function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  // Return the TextInput component factory
  return function TextInput (props) {

    // Extract style and strip RTL flag from the rest props
    const { style, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Track focus state to swap the border color
    const [focused, setFocused] = React.useState(false);

    // Assemble the base style classes from tokens
    const base = [
      CommonStyle['background_surface'],
      CommonStyle['br_md'],
      CommonStyle['p_h_md'],
      CommonStyle['p_v_sm'],
      CommonStyle['font_size_md'],
      CommonStyle['font_text_primary'],
      focused ? CommonStyle['border_primary'] : CommonStyle['border_default']
    ];

    // Render the native TextInput with focus handlers and themed styles
    return React.createElement(
      RNTextInput,
      Object.assign({
        style: [...base, style],
        placeholderTextColor: theme.Color.TEXT_MUTED,
        onFocus: function (e) {
          // Mark as focused and forward the event to the caller's handler
          setFocused(true); if (rest.onFocus) {
            rest.onFocus(e);
          }
        },
        onBlur: function (e) {
          // Mark as unfocused and forward the event to the caller's handler
          setFocused(false); if (rest.onBlur) {
            rest.onBlur(e);
          }
        }
      }, rest)
    );

  };

}
