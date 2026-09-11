// Info: Showcase registry hook. Consumes the component system built by
// the theme context's transform (one build per effective theme action)
// and returns the Component and Style references from the context.
// Does NOT create its own component-system build.
import { useLib } from '../../app-core/contexts/lib-context.js';

export default function useRegistry () {
  const Lib = useLib();
  const controller = Lib.ThemeContext.useThemeController();
  if (!controller) {
    return null;
  }
  return {
    Component: controller.Component,
    Style: controller.CommonStyle
  };
}
