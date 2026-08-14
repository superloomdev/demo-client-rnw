// Info: TextInput atom. A themed single-line input. Border/radius/padding/font all
// come from tokens; focus swaps the border to the primary color. Placeholder color
// uses a derived muted token so it reads consistently across shapes.
'use strict';

const React = require('react');
const { TextInput: RNTextInput } = require('react-native');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  return function TextInput (props) {

    const { style, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    const [focused, setFocused] = React.useState(false);

    const base = [
      CommonStyle['background_surface'],
      CommonStyle['br_md'],
      CommonStyle['p_h_md'],
      CommonStyle['p_v_sm'],
      CommonStyle['font_size_md'],
      CommonStyle['font_text_primary'],
      focused ? CommonStyle['border_primary'] : CommonStyle['border_default']
    ];

    return React.createElement(
      RNTextInput,
      Object.assign({
        style: [...base, style],
        placeholderTextColor: theme.Color.TEXT_MUTED,
        onFocus: function (e) {
          setFocused(true); if (rest.onFocus) {
            rest.onFocus(e);
          }
        },
        onBlur: function (e) {
          setFocused(false); if (rest.onBlur) {
            rest.onBlur(e);
          }
        }
      }, rest)
    );

  };

};
