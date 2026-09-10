// Info: Brand layer definitions for the demo application. Two sparse layers
// (tasks, notes) that overlay any profile's scheme to produce the app's
// brand accents.
//
// A layer is a partial overlay merged on top of the base scheme by the
// Themer engine. Switching schemes replaces the base; switching brands
// changes only the overlay (G14 regression: brand change keeps the scheme).

export const BRAND_LAYERS = {
  tasks: {
    name: 'tasks',
    tokens: {
      'color.interactive': '#4f46e5',
      'color.button_primary': '#4f46e5',
      'color.button_primary_hover': '#4338ca',
      'color.button_primary_active': '#3730a3',
      'color.link_primary': '#4f46e5',
      'color.focus': '#4f46e5',
      'font.family.sans': 'Poppins',
      'shape.radius_04': 8,
      'shape.radius_08': 12
    }
  },
  notes: {
    name: 'notes',
    tokens: {
      'color.interactive': '#0d9488',
      'color.button_primary': '#0d9488',
      'color.button_primary_hover': '#0f766e',
      'color.button_primary_active': '#115e59',
      'color.link_primary': '#0d9488',
      'color.focus': '#0d9488',
      'font.family.sans': 'Lora',
      'font.family.serif': 'Lora'
    }
  }
};

export default BRAND_LAYERS;
