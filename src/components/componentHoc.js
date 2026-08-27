// Info: The single Higher-Order Component every atom/molecule is wrapped with.
// It injects `isRtlActive` so each component can make per-platform RTL decisions
// without re-deriving direction. Mirrors the reference componentHoc.js.
import React from 'react';
import { I18nManager } from 'react-native';


export default function loader (Lib) {

  // Resolve direction once per build: web reads Config, native reads I18nManager
  const isRtlActive = Lib.Client.isBrowser()
    ? !!(Lib.Config && Lib.Config.locale && Lib.Config.locale.IS_RTL)
    : I18nManager.isRTL;

  // hoc(InnerComponent) -> Wrapped component with isRtlActive injected
  return function hoc (InnerComponent) {
    return function Wrapped (props) {
      // Render the inner component with the pre-resolved RTL flag merged into props
      return React.createElement(
        InnerComponent,
        Object.assign({ isRtlActive: isRtlActive }, props)
      );
    };
  };

}
