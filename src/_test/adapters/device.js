// Info: Test-tier stub adapter for the Device slot.
// Returns a static viewport (375x812) and no-op subscription, matching the
// js-rnw-helper-device contract: getPlatform, getViewport, onViewportChange.
'use strict';


/********************************************************************
Device adapter factory. Returns the Device contract surface with static
values suitable for unit tests (no real viewport, no subscriptions).

@param {Object} Lib    - Lib container (unused in stub)
@param {Object} config - Config (unused in stub)

@return {Object} - { getPlatform, getViewport, onViewportChange }
*********************************************************************/
module.exports = function (Lib, config) { // eslint-disable-line no-unused-vars

  // Static viewport dimensions (iPhone 13 mini)
  const WIDTH = 375;
  const HEIGHT = 812;

  return {

    // Return the platform identifier
    getPlatform: function () {
      return { success: true, platform: 'web', error: null };
    },

    // Return a fixed viewport size
    getViewport: function () {
      return { success: true, width: WIDTH, height: HEIGHT, error: null };
    },

    // No-op subscription: returns an unsubscribe that does nothing
    onViewportChange: function (callback) { // eslint-disable-line no-unused-vars
      return {
        success: true,
        unsubscribe: function () {},
        error: null
      };
    }

  };

};
