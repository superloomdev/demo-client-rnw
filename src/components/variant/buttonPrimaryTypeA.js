// Info: ButtonPrimaryTypeA (STRUCTURED EXCEPTION). An outlined/ghost variant of the
// canonical ButtonPrimary: transparent surface, primary border + primary label,
// subtle primary tint on hover/press. It DEVIATES in composition but still consumes
// the token system, so it stays in sync with theme changes. Registered in the
// variant registry (Component.variant) — discoverable, not a loose one-off.
'use strict';

const React = require('react');
const { Pressable } = require('react-native');


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  return function ButtonPrimaryTypeA (props) {

    const { title, icon, onPress, disabled, fullWidth, isRtlActive, ...rest } = props; // eslint-disable-line no-unused-vars

    const [hovered, setHovered] = React.useState(false);

    const containerBase = [
      CommonStyle['br_md'],
      CommonStyle['p_h_lg'],
      CommonStyle['p_v_md'],
      CommonStyle['border_primary'],
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
      fullWidth ? { alignSelf: 'stretch' } : null,
    ];

    const bg = function (pressed) {
      return (pressed || hovered)
        ? CommonStyle['background_app_primary_subtle']
        : CommonStyle['background_surface'];
    };

    return React.createElement(
      Pressable,
      Object.assign({
        onPress: disabled ? null : onPress,
        disabled: disabled,
        accessibilityRole: 'button',
        accessibilityLabel: title,
        onHoverIn: function () { setHovered(true); },
        onHoverOut: function () { setHovered(false); },
        style: function (state) { return [...containerBase, bg(state.pressed)]; },
      }, rest),
      icon
        ? React.createElement(Component.Icon, {
          name: icon, size: 'md', color: 'APP_PRIMARY', style: CommonStyle['m_e_sm'],
        })
        : null,
      React.createElement(Component.Text, {
        color: 'app_primary', weight: 'semibold', size: 'md',
      }, title)
    );

  };

};
