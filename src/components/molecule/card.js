// Info: Card molecule (CANONICAL). A themed surface with border, radius, padding
// and an elevation shadow. The shadow shows the ONLY kind of platform exception
// that exists (a platform-limited style prop, not a bundler feature):
//   web -> boxShadow string | ios -> shadow* props | android -> elevation
import React from 'react';
import { Platform } from 'react-native';

// Platform-limited elevation styling, resolved once
const SHADOW = Platform.select({
  web: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 2 }
});


export default function (Component, CommonStyle, theme, Lib) { // eslint-disable-line no-unused-vars

  // Return the Card component factory
  return function Card (props) {

    // Extract style, children, and remaining props
    const { style, children, ...rest } = props;

    // Render a themed surface with padding and platform-specific shadow
    return React.createElement(
      Component.View,
      Object.assign({
        background: 'surface',
        radius: 'lg',
        border: true,
        style: [CommonStyle['p_a_lg'], SHADOW, style]
      }, rest),
      children
    );

  };

}
