// Info: Expo adapter for the Icons slot (M-D3 = rnsvg)
//
// Maps the semantic icon manifest onto @carbon/icons descriptors rendered
// through react-native-svg. The manifest (data/icon-names.json) is the
// single source of truth for semantic names; this adapter resolves each
// name to a Carbon icon descriptor and renders the path data through
// Svg/Path components.
//
// @carbon/icons sizes are 16/20/24/32, matching the spec sheet's icon.sizes,
// so no size mapping table is needed.
import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const carbonIcons = require('@carbon/icons');
const manifest = require('@superloomdev/rnw-components/data/icon-names.json');

// Re-export resolveIconPaths for testing
export { resolveIconPaths } from './icon-paths.js';

// Build a lookup from semantic name (and aliases) to the Carbon camelCase
// name from the manifest's `carbon` field.
const SEMANTIC_TO_CARBON = {};

for (const [semanticName, entry] of Object.entries(manifest.icons)) {
  const carbonName = entry.carbon || semanticName.replace(/_/g, '-');
  SEMANTIC_TO_CARBON[semanticName] = carbonName;
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      SEMANTIC_TO_CARBON[alias] = carbonName;
    }
  }
}

// Convert a camelCase name to PascalCase (e.g., chevronDown -> ChevronDown)
function toPascalCase (name) {
  if (!name) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Cache for loaded descriptors
const descriptorCache = {};

// Load a Carbon icon descriptor by semantic name and size
function loadDescriptor (name, size) {
  const cacheKey = name + '@' + size;
  if (descriptorCache[cacheKey]) {
    return descriptorCache[cacheKey];
  }

  const carbonName = SEMANTIC_TO_CARBON[name] || name.replace(/_/g, '-');
  const pascalKey = toPascalCase(carbonName) + size;
  const descriptor = carbonIcons[pascalKey];
  if (descriptor) {
    descriptorCache[cacheKey] = descriptor;
  }
  return descriptor || null;
}

// Render a Carbon icon descriptor through react-native-svg
function ExpoIcon (props) {
  const { name, size, color, ...rest } = props;
  const resolvedSize = size || 16;
  const descriptor = loadDescriptor(name, resolvedSize);

  if (!descriptor) {
    // Fallback: render a question mark glyph
    return React.createElement(Svg, {
      width: resolvedSize,
      height: resolvedSize,
      viewBox: '0 0 32 32',
      ...rest
    },
    React.createElement(Path, {
      d: 'M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1.5-6.5h-3v-7h3z',
      fill: color || 'currentColor'
    }));
  }

  const attrs = descriptor.attrs || {};
  const viewBox = attrs.viewBox || '0 0 32 32';
  const fill = color || attrs.fill || 'currentColor';

  const paths = (descriptor.content || []).map(function (item, index) {
    if (item.elem === 'path') {
      const pathAttrs = item.attrs || {};
      const isInnerPath = pathAttrs['data-icon-path'] === 'inner-path';
      const pathFill = isInnerPath ? (pathAttrs.fill || fill) : fill;
      const pathOpacity = pathAttrs.opacity !== undefined ? parseFloat(pathAttrs.opacity) : undefined;
      return React.createElement(Path, {
        key: index,
        d: pathAttrs.d,
        fill: pathFill,
        opacity: pathOpacity
      });
    }
    if (item.elem === 'circle') {
      const cAttrs = item.attrs || {};
      return React.createElement(Path, {
        key: index,
        d: 'M' + (parseFloat(cAttrs.cx) - parseFloat(cAttrs.r)) + ' ' + parseFloat(cAttrs.cy) +
          ' A' + parseFloat(cAttrs.r) + ' ' + parseFloat(cAttrs.r) + ' 0 1 0 ' +
          (parseFloat(cAttrs.cx) + parseFloat(cAttrs.r)) + ' ' + parseFloat(cAttrs.cy) +
          ' A' + parseFloat(cAttrs.r) + ' ' + parseFloat(cAttrs.r) + ' 0 1 0 ' +
          (parseFloat(cAttrs.cx) - parseFloat(cAttrs.r)) + ' ' + parseFloat(cAttrs.cy) + ' Z',
        fill: fill
      });
    }
    return null;
  }).filter(Boolean);

  return React.createElement(Svg, {
    width: resolvedSize,
    height: resolvedSize,
    viewBox: viewBox,
    ...rest
  }, ...paths);
}

export default function (Lib, config) { // eslint-disable-line no-unused-vars

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: ExpoIcon
  };

}
