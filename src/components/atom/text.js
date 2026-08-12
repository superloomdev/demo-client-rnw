// Info: Text atom. Maps typography props to generated utility classes:
//   size  -> font_size_<size>     (xs|sm|md|lg|xl|xxl)
//   color -> font_<color>         (text_primary|text_secondary|app_primary|...)
//   weight-> font_weight_<weight> (regular|medium|semibold|bold)
// Applies iOS writingDirection under RTL (matches the reference's platform branch).
'use strict';

const React = require('react');
const { Text: RNText, StyleSheet } = require('react-native');

const Style = StyleSheet.create({
  rtlIOS: { writingDirection: 'rtl' },
});


module.exports = function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  return function Text (props) {

    const {
      size, color, weight, align, style, children, isRtlActive, ...rest
    } = props;

    // Resolve token props to utility classes
    const cls = [
      CommonStyle['font_size_' + (size || 'md')],
      CommonStyle['font_' + (color || 'text_primary')],
      CommonStyle['font_weight_' + (weight || 'regular')],
    ];

    // Alignment (plain inline; not a token)
    if (align) { cls.push({ textAlign: align }); }

    // iOS RTL writing direction
    if (isRtlActive && Lib.Client.isIOS()) { cls.push(Style.rtlIOS); }

    return React.createElement(
      RNText,
      Object.assign({ style: [...cls, style] }, rest),
      children
    );

  };

};
