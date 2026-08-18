// Info: ButtonPrimaryTypeA (STRUCTURED EXCEPTION). An outlined/ghost variant of the
// canonical ButtonPrimary: transparent surface, primary border + primary label,
// subtle primary tint on hover/press. It DEVIATES in composition but still consumes
// the token system, so it stays in sync with theme changes. Registered in the
// variant registry (Component.variant) - discoverable, not a loose one-off.
'use strict';

const React = require('react');
const { Pressable } = require('react-native');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  // Return the ButtonPrimaryTypeA component factory
  return function ButtonPrimaryTypeA (props) {

    // Extract button props and strip RTL flag from the rest
    const { title, icon, onPress, disabled, fullWidth, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Track hover state for web interactions
    const [hovered, setHovered] = React.useState(false);

    // Assemble the outlined container style from tokens
    const containerBase = [
      CommonStyle['br_md'],
      CommonStyle['p_h_lg'],
      CommonStyle['p_v_md'],
      CommonStyle['border_primary'],
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
      fullWidth ? { alignSelf: 'stretch' } : null
    ];

    // Resolve background: subtle tint on interaction, transparent otherwise
    const bg = function (pressed) {
      // Subtle tint when pressed or hovered, otherwise transparent surface
      return (pressed || hovered)
        ? CommonStyle['background_app_primary_subtle']
        : CommonStyle['background_surface'];
    };

    // Render the Pressable with outlined styling and icon/label children
    return React.createElement(
      Pressable,
      Object.assign({
        onPress: disabled ? null : onPress,
        disabled: disabled,
        accessibilityRole: 'button',
        accessibilityLabel: title,
        onHoverIn: function () {
          // Mark as hovered on mouse enter
          setHovered(true);
        },
        onHoverOut: function () {
          // Clear hover on mouse leave
          setHovered(false);
        },
        style: function (state) {
          // Combine container base with state-dependent background
          return [...containerBase, bg(state.pressed)];
        }
      }, rest),
      icon
        ? React.createElement(Component.Icon, {
          name: icon, size: 'md', color: 'APP_PRIMARY', style: CommonStyle['m_e_sm']
        })
        : null,
      React.createElement(Component.Text, {
        color: 'app_primary', weight: 'semibold', size: 'md'
      }, title)
    );

  };

};
