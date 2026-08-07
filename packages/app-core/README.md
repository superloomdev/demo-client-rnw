# packages/app-core

Shared app logic, shape registry, and DI wiring. No host dependency.

This package will hold the host-independent logic currently embedded in
`hosts/expo/common/` (client detection, super-app shape registry, configuration).
Extraction is deferred until the bare host (`hosts/bare/`) is built, because
the boundary between shared and host-specific code is only visible when there
are two hosts to test against.

Until then, the Expo host carries the shared logic inline. This placeholder
exists so the target layout is adopted now and the extraction is an addition,
not a restructuring.
