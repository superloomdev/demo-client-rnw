import { useMemo } from 'react';
import { useLib } from '../../app-core/contexts/lib-context.js';

export default function useRegistry () {
  const Lib = useLib();
  const { useTheme } = Lib.ThemeContext;
  const theme = useTheme();

  return useMemo(function () {
    if (!theme) {
      return null;
    }

    const system = Lib.Components.createSystem({
      Utils: Lib.Utils,
      Debug: Lib.Debug,
      React: Lib.React,
      Device: Lib.Device,
      Icons: Lib.Icons,
      Font: Lib.Font,
      Themer: Lib.Themer
    }, { STRICT_TOKENS: true }, { tokens: theme }, 'base');

    const roster = Lib.Components.roster;
    system.addComponents(roster.COMPONENTS);
    system.addVariants(roster.VARIANTS);
    system.addFreeforms(roster.FREEFORMS);
    system.addProviders(roster.PROVIDERS);

    const check = system.checkRegistry();
    if (!check.complete) {
      throw new Error('Incomplete registry: ' + JSON.stringify(check.missing));
    }

    if (typeof globalThis !== 'undefined') {
      globalThis.__systemBuilds = (globalThis.__systemBuilds || 0) + 1;
    }

    return { Component: system.Component, Style: system.Style };
  }, [Lib, theme]);
}
