// Info: Expo adapter for the Icons slot. Maps the icon contract onto
// @expo/vector-icons. The glyph set is a vendor choice and lives only here.
import { Ionicons } from '@expo/vector-icons';


export default function (Lib, config) { // eslint-disable-line no-unused-vars

  // Capability-named member; the vendor name stops at this file
  return {
    Glyph: Ionicons
  };

};
