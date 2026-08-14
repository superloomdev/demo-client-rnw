// Info: Expo adapter for the Fonts slot. Supplies the platform font loader
// extension and the host's font asset manifest. Every Expo-only font package
// is required here and nowhere else.
'use strict';

const FontExtExpo = require('@superloomdev/js-client-helper-font-ext-expo');
const Poppins = require('@expo-google-fonts/poppins');


module.exports = function (Lib, config) { // eslint-disable-line no-unused-vars

  // The platform loader extension; needs Font, Utils and Debug off the container
  const adapter = FontExtExpo(Lib, {});

  // Host-owned asset manifest; family names must match what the themes name
  const manifest = {
    Poppins_400Regular: {
      styles: {
        normal: {
          asset: Poppins.Poppins_400Regular,
          weight: '400',
          style: 'normal'
        }
      }
    },
    Poppins_600SemiBold: {
      styles: {
        semibold: {
          asset: Poppins.Poppins_600SemiBold,
          weight: '600',
          style: 'normal'
        }
      }
    }
  };

  return {
    adapter: adapter,
    manifest: manifest
  };

};
