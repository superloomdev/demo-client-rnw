# hosts/bare

Bare React Native + web shell. Injects bare (non-Expo) adapters.

**Pinned by Plan 0073.** This host is not built until the Expo pin is lifted.
The directory exists so the two-host layout is adopted now; adding the bare
host later is an addition rather than a restructuring.

When unblocked, this host will:
- Use React Native CLI (not Expo) for native builds
- Use Vite or similar for web builds
- Inject bare font, device, and KV adapters (the non-Expo extensions)
- Share `packages/app-core/` and `packages/screens/` with the Expo host
- Serve as a conformance test: any Expo leak into shared code fails here
