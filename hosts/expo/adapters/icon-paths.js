// Info: Carbon icon path resolution (M.6)
//
// Resolves semantic icon names from the manifest to @carbon/icons
// descriptor path data. Separated from the react-native-svg adapter so
// path-data assertions can run in Node.js without react-native.
//
// Carbon descriptors use a mix of `path`, `circle`, and `rect` elements.
// For verifiability, all elements are normalized to path data (`d`)
// strings: circles are converted to arc paths, rects to line paths.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const manifest = require('@superloomdev/rnw-components/data/icon-names.json');
const carbonIcons = require('@carbon/icons');

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

// Convert a circle element to a path data string
function circleToPath (cx, cy, r) {
  const x0 = cx - r;
  const x1 = cx + r;
  return 'M' + x0 + ' ' + cy +
    ' A' + r + ' ' + r + ' 0 1 0 ' + x1 + ' ' + cy +
    ' A' + r + ' ' + r + ' 0 1 0 ' + x0 + ' ' + cy + ' Z';
}

// Convert a rect element to a path data string
function rectToPath (x, y, width, height) {
  const x1 = x + width;
  const y1 = y + height;
  return 'M' + x + ' ' + y +
    ' L' + x1 + ' ' + y +
    ' L' + x1 + ' ' + y1 +
    ' L' + x + ' ' + y1 + ' Z';
}

// Normalize a content item to a path data string
function itemToPathData (item) {
  if (!item || !item.elem || !item.attrs) {
    return null;
  }
  if (item.elem === 'path') {
    return item.attrs.d || null;
  }
  if (item.elem === 'circle') {
    const cx = parseFloat(item.attrs.cx);
    const cy = parseFloat(item.attrs.cy);
    const r = parseFloat(item.attrs.r);
    if (isNaN(cx) || isNaN(cy) || isNaN(r)) {
      return null;
    }
    return circleToPath(cx, cy, r);
  }
  if (item.elem === 'rect') {
    const x = parseFloat(item.attrs.x || 0);
    const y = parseFloat(item.attrs.y || 0);
    const w = parseFloat(item.attrs.width || 0);
    const h = parseFloat(item.attrs.height || 0);
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      return null;
    }
    return rectToPath(x, y, w, h);
  }
  return null;
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

// Resolve the path data strings from a descriptor. All SVG elements
// (path, circle, rect) are normalized to path data strings.
export function resolveIconPaths (name, size) {
  const descriptor = loadDescriptor(name, size || 16);
  if (!descriptor || !descriptor.content) {
    return null;
  }
  const paths = [];
  for (const item of descriptor.content) {
    const d = itemToPathData(item);
    if (d) {
      paths.push(d);
    }
  }
  return paths.length ? paths : null;
}

// Export the manifest for the adapter
export { manifest };
