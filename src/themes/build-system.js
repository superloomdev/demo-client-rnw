// Info: System builder for the demo application. Validates font family roles
// against the font core registry, falls back to System for unregistered
// families with a single-attempt loadFamily guard, then builds the standard
// component system through the published rnw-components package.
//
// The transform carried over from the old assemble.js:
// 1. Validate font.family.* roles against Lib.Font.isRegistered
// 2. Fall back to System for unregistered families
// 3. Trigger async loading via Lib.Fonts.loadFamily (once per family)
// 4. Call Lib.Components.createSystem with the shared_libs set
// 5. Register variant and freeform components on the system


// Families whose async load has already been attempted this session. A
// family that cannot register, because the host manifest does not carry
// it, must not re-trigger a re-derive on every build, which would spin
// the theme forever.
const ATTEMPTED = new Set();


// RNW component libraries always consume the native theme projection on
// every platform including web. RNW is itself the web projection;
// requesting web applies two projections and yields unit strings that
// React Native cannot consume on iOS or Android.
export const THEME_PLATFORM = 'native';


/********************************************************************
Build the component system from a built theme. Validates font families
against the font core registry, falls back to System for unregistered
families, then creates the standard component system and registers
the app's variant and freeform components.

@param {Object} Lib              - the dependency container
@param {Object} Lib.Components   - the rnw-components package
@param {Object} Lib.Font          - the font core (isRegistered)
@param {Object} Lib.Fonts        - font manifest (loadFamily)
@param {Object} Lib.Debug        - debug logger
@param {Object} built            - the themer's buildTheme result
@param {Object} built.tokens     - the flat token map
@param {Array}  currentLayers    - the current layer array (for re-derive)
@param {Object} updateLayersRef  - React ref to the extension's update_layers
@param {Object} variant          - variant components to register
@param {Object} freeform         - freeform components to register
@param {string} breakpoint       - the active breakpoint name

@return {Object} - { system, theme }
*********************************************************************/
export function buildSystem (Lib, built, currentLayers, updateLayersRef, variant, freeform, breakpoint) {

  // Derive missing per-kind disabled state tokens from the generic disabled
  // token. The published Button component reads background_button_primary_disabled
  // and similar state keys; the Carbon profile provides only color.button_disabled.
  // Without these derived tokens, STRICT_TOKENS throws on disabled buttons.
  const genericDisabled = built.tokens['color.button_disabled'];
  if (genericDisabled) {
    ['primary', 'secondary', 'danger', 'tertiary'].forEach(function (kind) {
      const stateKey = 'color.button_' + kind + '_disabled';
      if (!built.tokens[stateKey]) {
        built.tokens[stateKey] = genericDisabled;
      }
    });
  }

  // Derive shape.pill from shape.radius_max. The published Image and
  // other components read br_pill; the Carbon profile provides radius_max
  // (9999) but not pill.
  if (!built.tokens['shape.pill'] && built.tokens['shape.radius_max']) {
    built.tokens['shape.pill'] = built.tokens['shape.radius_max'];
  }

  // Extract the font family roles from the built tokens
  const familyRoles = Object.keys(built.tokens).filter(function (key) {
    return key.indexOf('font.family.') === 0;
  });

  // Validate each font family role against the font core registry.
  // Unregistered families fall back to System and trigger async loading.
  for (let i = 0; i < familyRoles.length; i++) {
    const role = familyRoles[i];
    const familyName = built.tokens[role];

    // Check if the family is registered in the font core
    if (Lib.Font && Lib.Font.isRegistered) {
      if (!Lib.Font.isRegistered(familyName) && familyName !== 'System') {

        // Log warning for the unregistered family
        if (Lib.Debug) {
          Lib.Debug.warn('theme: family "' + familyName + '" not registered, falling back to System');
        }

        // Fall back to System for now
        built.tokens[role] = 'System';

        // Trigger async loading of the family, then re-derive. The ledger
        // makes the attempt once per family; the isRegistered check makes
        // the re-derive conditional on the load having really landed.
        if (Lib.Fonts && Lib.Fonts.loadFamily && !ATTEMPTED.has(familyName)) {
          ATTEMPTED.add(familyName);
          Lib.Fonts.loadFamily(familyName).then(function (result) {
            if (result.success && Lib.Font.isRegistered(familyName)) {

              // Re-derive by calling update_layers with a fresh copy
              if (updateLayersRef && updateLayersRef.current) {
                updateLayersRef.current(currentLayers.slice());
              }

            }
          });
        }

      }
    }
  }

  // Create the standard component system through the published package
  const system = Lib.Components.createSystem({
    Utils: Lib.Utils,
    Debug: Lib.Debug,
    React: Lib.React,
    Device: Lib.Device,
    Icons: Lib.Icons,
    Font: Lib.Font,
    Themer: Lib.Themer
  }, { STRICT_TOKENS: true }, built, breakpoint);

  // Register the full component roster from the published package
  const roster = Lib.Components.roster;
  system.addComponents(roster.COMPONENTS);
  system.addVariants(roster.VARIANTS);
  system.addFreeforms(roster.FREEFORMS);
  system.addProviders(roster.PROVIDERS);

  // Register the app's local variant and freeform components
  if (variant) {
    system.addVariants(variant);
  }
  if (freeform) {
    system.addFreeforms(freeform);
  }

  // Return the system and the built theme tokens
  return {
    system: system,
    theme: built.tokens
  };

}


export default buildSystem;
