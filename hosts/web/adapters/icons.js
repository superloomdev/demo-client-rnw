// Info: Web adapter for the Icons slot.
// Maps the icon contract onto Ionicons SVGs (same icon set as the Expo host,
// which uses @expo/vector-icons/Ionicons). Icon names follow the Ionicons
// naming convention: kebab-case with -outline / -sharp variants.
//
// The adapter converts kebab-case names to camelCase keys, resolves the SVG
// data URI from the ionicons package, decodes it, and renders an inline SVG
// element with the requested size and color. A small alias table maps names
// that do not have a direct Ionicons equivalent.
'use strict';

const React = require('react');
const ionicons = require('ionicons/icons');


// Names used in the codebase that need aliasing to Ionicons keys
const ALIASES = {
  'check':             'checkmark',
  'overflow':          'ellipsisHorizontal',
  'chevron--down':     'chevronDown',
  'chevron--up':       'chevronUp',
  'chevron--right':    'chevronForward',
  'info':              'information'
};


// Convert a kebab-case icon name to the camelCase key used by ionicons/icons
function resolveIconKey (name) {

  if (!name) {
    return null;
  }

  // Check alias table first
  if (ALIASES[name]) {
    return ALIASES[name];
  }

  // kebab-case -> camelCase: add -> add, alert-circle -> alertCircle
  return name.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });

}


// Extract the raw SVG markup from the ionicons data URI
function decodeSvg (dataUri) {

  if (!dataUri) {
    return null;
  }

  // Strip the data URI prefix and decode
  const prefix = 'data:image/svg+xml;utf8,';
  if (dataUri.indexOf(prefix) === 0) {
    return decodeURIComponent(dataUri.substring(prefix.length));
  }

  return null;

}


// Render an Ionicons SVG as an inline React element with size and color
function IonIcon (props) {

  const { name, size, color, style, ...rest } = props;
  const px = size || 24;

  const key = resolveIconKey(name);
  const dataUri = key ? ionicons[key] : null;
  const svgMarkup = decodeSvg(dataUri);

  // Fallback: if the icon name is not found, render a placeholder square
  if (!svgMarkup) {
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
        ...style
      },
      ...rest
    }, '?');
  }

  // Parse the SVG string into a React element.
  // The ionicons SVGs have a 512x512 viewBox and use stroke for outline icons.
  // We inject fill/stroke color and set width/height.
  // dangerouslySetInnerHTML is safe here: the SVG comes from the ionicons npm
  // package, not user input.
  return React.createElement('span', {
    style: {
      width: px,
      height: px,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
    ...rest
  }, React.createElement('span', {
    style: {
      width: px,
      height: px,
      display: 'inline-block',
      lineHeight: 0
    },
    dangerouslySetInnerHTML: {
      __html: svgMarkup.replace('<svg ', '<svg width="' + px + '" height="' + px + '" style="fill: ' + (color || 'currentColor') + '; stroke: ' + (color || 'currentColor') + ';" ')
    }
  }));

}


module.exports = function (Lib, config) { // eslint-disable-line no-unused-vars

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: IonIcon
  };

};
