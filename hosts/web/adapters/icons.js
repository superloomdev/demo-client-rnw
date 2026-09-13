// Info: Web adapter for the Icons slot (Plan 0156, Part C).
//
// Maps the semantic icon manifest onto @carbon/icons-react SVGs. The
// manifest (data/icon-names.json) is the single source of truth for
// semantic names; this adapter resolves each name to a Carbon icon
// component and renders it as an inline SVG with currentColor.
//
// Key changes from the Ionicons adapter:
// - Uses @carbon/icons-react (Carbon's icon set) instead of Ionicons
// - Resolves names through the semantic manifest, not ad-hoc aliases
// - Renders inline SVG with fill="currentColor" (Carbon icons are fill-based)
// - Does not force stroke on fill icons or fill on stroke icons
// - Carbon icons use a 16x16 viewBox by default; size is set via width/height

import React from 'react';
import * as CarbonIcons from '@carbon/icons-react';
import manifest from '@superloomdev/rnw-components/data/icon-names.json';

// Convert a camelCase name to PascalCase (Carbon icons are PascalCase exports)
function toPascalCase (name) {
  if (!name) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Build a lookup from semantic name (and aliases) to Carbon icon key
const NAME_TO_CARBON = {};

for (const [semanticName, entry] of Object.entries(manifest.icons)) {
  const carbonKey = toPascalCase(entry.carbon);
  if (carbonKey && CarbonIcons[carbonKey]) {
    NAME_TO_CARBON[semanticName] = carbonKey;
  }
  // Register aliases
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      NAME_TO_CARBON[alias] = carbonKey;
    }
  }
}

// Names already reported, so each unmapped name errors once per session
const REPORTED_UNMAPPED = new Set();

// Resolve a semantic name to a Carbon icon component
function resolveIcon (name) {
  if (!name) {
    return null;
  }
  const carbonKey = NAME_TO_CARBON[name];
  if (!carbonKey) {
    return null;
  }
  const IconComponent = CarbonIcons[carbonKey];
  return IconComponent || null;
}

// Render a Carbon icon as an inline React element with size and color.
// Carbon icons are React components that accept size, fill, and width/height.
// pointerEvents: none lets clicks pass through to the parent Pressable.
function CarbonIcon (props) {
  const { name, size, color, style, ...rest } = props;
  const px = size || 16;

  const IconComponent = resolveIcon(name);

  // Fallback: if the icon name is not found, render a placeholder square
  if (!IconComponent) {
    if (!REPORTED_UNMAPPED.has(name)) {
      REPORTED_UNMAPPED.add(name);
      console.error('icons: unmapped semantic icon "' + name + '"');
    }
    return React.createElement('span', {
      style: {
        width: px,
        height: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, px / 2.5),
        fontWeight: '600',
        lineHeight: 1,
        color: color || '#000',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        ...style
      },
      ...rest
    }, '?');
  }

  // Carbon icons accept a `size` prop (16, 20, 24, 32) and render an SVG.
  // We pass fill={color} for color resolution. Carbon icons use
  // fill="currentColor" by default, so we set the color via the fill prop.
  // The icon's internal paths use fill, not stroke, so we do not force stroke.
  return React.createElement(IconComponent, {
    size: px,
    fill: color || 'currentColor',
    style: {
      pointerEvents: 'none',
      ...style
    },
    ...rest
  });
}

export default function (Lib, config) { // eslint-disable-line no-unused-vars

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: CarbonIcon
  };

}
