// Info: The super-app brain. Holds the registry of app shapes this one core can
// take, and the determineApp() switch the entry uses to decide what to mount —
// the direct analogue of the reference root.js `determineApp`. Adding a new shape
// = add an entry here + a matching app/<shape>/ route folder + its theme seeds.
'use strict';


module.exports = function loader (Lib, Config) {

  // Shape registry: presentation metadata for each hostable shape
  const SHAPES = {
    tasks: {
      key: 'tasks',
      label: 'Tasks',
      tagline: 'Plan your day and check it off',
      icon: 'checkbox-outline',
      route: '/tasks'
    },
    notes: {
      key: 'notes',
      label: 'Notes',
      tagline: 'Capture thoughts, fast',
      icon: 'document-text-outline',
      route: '/notes'
    },
    showcase: {
      key: 'showcase',
      label: 'Carbon Components',
      tagline: 'Every Carbon component, live',
      icon: 'grid-outline',
      route: '/showcase'
    }
  };

  const SuperApp = {

    // Every shape this build is allowed to host (driven by Config)
    listShapes: function () {
      return Config.super_app.AVAILABLE_SHAPES
        .map(function (k) {
          return SHAPES[k];
        })
        .filter(Boolean);
    },

    // Look up one shape's metadata
    getShape: function (key) {
      return SHAPES[key] || null;
    },

    // The entry switch: lean boots straight into a shape; super shows the launcher
    determineApp: function () {
      if (Config.super_app.MODE === 'lean') {
        const shape = SHAPES[Config.super_app.APP_SHAPE] || SHAPES[Config.super_app.AVAILABLE_SHAPES[0]];
        return { mode: 'lean', shape: shape };
      }
      return { mode: 'super' };
    }

  };

  return SuperApp;

};
