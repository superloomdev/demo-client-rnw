// Info: ButtonPrimary molecule (CANONICAL). Composes atoms (Icon + Text) inside a
// Pressable and drives every visual from tokens + interaction state:
//   bg:  APP_PRIMARY -> _HOVERED (web) / _PRESSED / _DISABLED
//   fg:  TEXT_ON_PRIMARY (auto-contrast against the primary)
// Hover is web-only (Pressable onHoverIn/Out); press works on all platforms.
import React from 'react';
import { Pressable } from 'react-native';


export default function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  // Return the ButtonPrimary component factory
  return function ButtonPrimary (props) {

    // Extract button props and strip RTL flag from the rest
    const { title, icon, onPress, disabled, fullWidth, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    // Track hover state for web interactions
    const [hovered, setHovered] = React.useState(false);

    // Resolve background class from state
    const bgClass = function (pressed) {
      // Select background class based on interaction and disabled state
      if (disabled) {
        // Disabled state uses the muted background
        return CommonStyle['background_app_primary_disabled'];
      }
      if (pressed) {
        // Pressed state uses the pressed background
        return CommonStyle['background_app_primary_pressed'];
      }
      if (hovered) {
        // Hovered state uses the hovered background
        return CommonStyle['background_app_primary_hovered'];
      }
      // Default resting state uses the primary background
      return CommonStyle['background_app_primary'];
    };

    // Assemble the container layout styles from tokens
    const containerBase = [
      CommonStyle['br_md'],
      CommonStyle['p_h_lg'],
      CommonStyle['p_v_md'],
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
      fullWidth ? { alignSelf: 'stretch' } : null
    ];

    // Render the Pressable with state-driven styling and icon/label children
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
          return [...containerBase, bgClass(state.pressed)];
        }
      }, rest),
      // Children: optional leading icon + label, both in the on-primary color
      function (state) { // eslint-disable-line no-unused-vars
        // Render the icon and text atoms inside a fragment
        return React.createElement(
          React.Fragment,
          null,
          icon
            ? React.createElement(Component.Icon, {
              name: icon,
              size: 'md',
              color: 'TEXT_ON_PRIMARY',
              style: CommonStyle['m_e_sm']
            })
            : null,
          React.createElement(Component.Text, {
            color: 'text_on_primary',
            weight: 'semibold',
            size: 'md'
          }, title)
        );
      }
    );

  };

}
