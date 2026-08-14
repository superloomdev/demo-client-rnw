// Info: Test-tier stub adapter for the Fonts slot.
// System-only: no platform font loader, empty manifest.
'use strict';


module.exports = function (Lib, config) { // eslint-disable-line no-unused-vars

  const adapter = {
    loadManifest: function () {
      return Promise.resolve({ success: true, error: null });
    },
    isReady: function () {
      return { success: true, ready: true };
    },
    isFamilyLoaded: function () {
      return { loaded: true };
    }
  };

  const manifest = {};

  return {
    adapter: adapter,
    manifest: manifest
  };

};
