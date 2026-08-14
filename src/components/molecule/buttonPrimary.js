// Info: ButtonPrimary molecule (CANONICAL). Composes atoms (Icon + Text) inside a
// Pressable and drives every visual from tokens + interaction state:
//   bg:  APP_PRIMARY -> _HOVERED (web) / _PRESSED / _DISABLED
//   fg:  TEXT_ON_PRIMARY (auto-contrast against the primary)
// Hover is web-only (Pressable onHoverIn/Out); press works on all platforms.
'use strict';

const React = require('react');
const { Pressable } = require('react-native');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  return function ButtonPrimary (props) {

    const { title, icon, onPress, disabled, fullWidth, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    const [hovered, setHovered] = React.useState(false);

    // Resolve background class from state
    const bgClass = function (pressed) {
      if (disabled) {
        return CommonStyle['background_app_primary_disabled'];
      }
      if (pressed) {
        return CommonStyle['background_app_primary_pressed'];
      }
      if (hovered) {
        return CommonStyle['background_app_primary_hovered'];
      }
      return CommonStyle['background_app_primary'];
    };

    const containerBase = [
      CommonStyle['br_md'],
      CommonStyle['p_h_lg'],
      CommonStyle['p_v_md'],
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
      fullWidth ? { alignSelf: 'stretch' } : null
    ];

    return React.createElement(
      Pressable,
      Object.assign({
        onPress: disabled ? null : onPress,
        disabled: disabled,
        accessibilityRole: 'button',
        accessibilityLabel: title,
        onHoverIn: function () {
          setHovered(true);
        },
        onHoverOut: function () {
          setHovered(false);
        },
        style: function (state) {
          return [...containerBase, bgClass(state.pressed)];
        }
      }, rest),
      // Children: optional leading icon + label, both in the on-primary color
      function (state) { // eslint-disable-line no-unused-vars
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

};
