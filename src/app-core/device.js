// Info: Device adapter for the demo application. Provides the
// js-rnw-helper-device contract (getPlatform, getViewport, onViewportChange)
// backed by react-native's Platform + Dimensions so it works on web, iOS,
// and Android without an extra dependency.
import { Platform, Dimensions } from 'react-native';


/********************************************************************
Device adapter factory. Returns the Device contract surface backed by
the react-native Platform + Dimensions modules.

@param {Object} Lib    - Lib container (unused)
@param {Object} config - Config (unused)

@return {Object} - { getPlatform, getViewport, onViewportChange }
*********************************************************************/
export default function (Lib, config) { // eslint-disable-line no-unused-vars

  // Track active viewport listeners so they can be cleaned up on unsubscribe
  const listeners = [];


  // Return the Device adapter object matching the js-rnw-helper-device contract
  return {

    getPlatform: function () {
      // Return the current platform identifier in the Device adapter contract shape
      return { success: true, platform: Platform.OS, error: null };
    },

    getViewport: function () {
      // Query the current window dimensions from the native platform
      const win = Dimensions.get('window');
      // Return the viewport payload in the Device adapter contract shape
      return { success: true, width: win.width, height: win.height, error: null };
    },

    onViewportChange: function (callback) {
      // Register the callback so we can remove it later on unsubscribe
      listeners.push(callback);

      // Subscribe to native dimension changes and forward them to the callback
      const sub = Dimensions.addEventListener('change', function (dims) {
        // Extract the window dimensions from the change event payload
        const win = dims.window || dims;
        callback({ width: win.width, height: win.height });
      });

      // Return an unsubscribe handle so callers can release the listener
      return {
        success: true,
        unsubscribe: function () {
          // Remove the callback from the tracked listener list if still present
          const idx = listeners.indexOf(callback);
          if (idx !== -1) {
            listeners.splice(idx, 1);
          }
          if (sub && Lib.Utils.isFunction(sub.remove)) {
            sub.remove();
          }
        },
        error: null
      };
    }

  };

};
