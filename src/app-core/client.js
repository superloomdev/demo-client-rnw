// Info: Platform client helper. The one place that knows "which platform are we
// on". Every other module asks Lib.Client (isBrowser / isNative / os) instead of
// importing react-native Platform directly, so platform branches stay centralized
// and the rest of the codebase reads as platform-agnostic.
import { Platform } from 'react-native';


/********************************************************************
Loader. Returns the Client interface. Accepts (Lib, Config) for
interface uniformity with every other Superloom module.

@param {Object} shared_libs - Lib container (unused here)
@param {Object} config - Merged config (unused here)

@return {Object} - Public Client interface
*********************************************************************/
export default function loader (shared_libs, config) { // eslint-disable-line no-unused-vars

  // Public interface
  const Client = {

    // True on the web target (RNW in the browser, and inside Electron's Chromium)
    isBrowser: function () {
      // Return whether this is the web target
      return Platform.OS === 'web';
    },

    // True on a real native runtime (device or simulator)
    isNative: function () {
      // Return whether this is a native runtime
      return Platform.OS === 'ios' || Platform.OS === 'android';
    },

    isIOS: function () {
      // Return whether this is iOS
      return Platform.OS === 'ios';
    },

    isAndroid: function () {
      // Return whether this is Android
      return Platform.OS === 'android';
    },

    // Raw platform string: 'web' | 'ios' | 'android'
    os: function () {
      // Return the raw platform string
      return Platform.OS;
    }

  };

  // Return the interface
  return Client;

}
