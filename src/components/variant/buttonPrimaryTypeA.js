// Info: ButtonPrimaryTypeA (STRUCTURED EXCEPTION). An outlined/ghost variant of
// the primary button: transparent surface, interactive border + interactive label,
// subtle accent tint on hover/press. It DEVIATES in composition but still consumes
// the token system, so it stays in sync with theme changes. Registered in the
// variant registry (Component.variant) - discoverable, not a loose one-off.
//
// Variant factories receive the same injection set as canonical components:
// (Lib, CONFIG, ERRORS, Parts, Registry, Style).
import React from 'react';
import { Pressable } from 'react-native';


export default function (Lib, CONFIG, ERRORS, Parts, Registry, Style) {

  // Return the ButtonPrimaryTypeA component factory
  return function ButtonPrimaryTypeA (props) {

    // Extract button props
    const { title, icon, onPress, disabled, fullWidth, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Track hover state for web interactions
    const [hovered, setHovered] = React.useState(false);

    // Assemble the outlined container style from tokens
    const containerBase = [
      Style.utilities['br_radius_04'],
      Style.utilities['p_h_spacing_05'],
      Style.utilities['p_v_spacing_04'],
      Style.utilities['border_w_width_01'],
      Style.utilities['border_color_interactive'],
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
      fullWidth ? { alignSelf: 'stretch' } : null
    ];

    // Resolve background: subtle tint on interaction, transparent otherwise
    const bg = function (pressed) {
      // Subtle tint when pressed or hovered, otherwise transparent surface
      return (pressed || hovered)
        ? Style.utilities['background_layer_accent_01']
        : Style.utilities['background_background'];
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
        ? React.createElement(Registry.Icon, {
          name: icon, size: 'md', color: 'interactive', style: Style.utilities['m_e_spacing_03']
        })
        : null,
      React.createElement(Registry.Text, {
        color: 'interactive', weight: 'semibold', typeSet: 'body01'
      }, title)
    );

  };

}
