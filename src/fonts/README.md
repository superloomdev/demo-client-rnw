# fonts/

Host-owned font manifest. The themer engine only *names* font families (data);
this folder owns *loading* them. Contract: if a theme names family `X`, register
`X` here.

## The three delivery mechanisms (one per app shape)

| App shape | Mechanism | Family | Source |
|---|---|---|---|
| `main` / base | **System** | `System` | nothing to load |
| `tasks` | **Google font** | `Poppins_400Regular`, `Poppins_600SemiBold` | `@expo-google-fonts/poppins` |
| `notes` | **Custom bundled** | `Lora` | raw `.ttf` in `assets/` |

All three funnel through one `expo-font` `useFonts()` call in `fonts.js`. On
native it registers the faces; on web it injects the matching `@font-face`.

## Files

- `fonts.js` - DI singleton loader. Injects the font loader adapter via `Lib.FontLoader`,
  builds the family→module map, exposes `useFontsReady()` and `families`.
- `assets/index.js` - the raw bundled-font map (custom mechanism). Ships empty.
- `assets/*.ttf` - the bundled font files you add.

## Enabling the custom font (Lora)

The demo runs immediately with Poppins (Google) + System. To enable the
custom-bundled mechanism for the Notes app:

1. Download **Lora** from <https://fonts.google.com/specimen/Lora> (OFL license).
2. Drop `Lora-Regular.ttf` into `assets/`.
3. Uncomment the `Lora: require('./Lora-Regular.ttf')` line in `assets/index.js`.

Until then, the Notes theme falls back to `System` - no build error, no missing
asset.
