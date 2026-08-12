// Info: Web adapter for the Fonts slot.
// System-only: no platform font loader, empty manifest.
// The harness proves portability, not font rendering.
'use strict';


module.exports = function (Lib, config) {

  // Minimal no-op font adapter satisfying the font extension contract
  const adapter = {
    loadManifest: function () { return Promise.resolve({ success: true, error: null }); },
    isReady: function () { return { success: true, ready: true }; },
    isFamilyLoaded: function () { return { loaded: true }; }
  };

  // No bundled font assets in the harness
  const manifest = {};

  return {
    adapter: adapter,
    manifest: manifest
  };

};
