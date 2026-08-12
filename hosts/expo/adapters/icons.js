// Info: Expo adapter for the Icons slot. Maps the icon contract onto
// @expo/vector-icons. The glyph set is a vendor choice and lives only here.
'use strict';

const { Ionicons } = require('@expo/vector-icons');


module.exports = function (Lib, config) {

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: Ionicons
  };

};
