// Info: Pre-import hook for the test runner.
//
// Registers the ESM resolve hook that redirects 'react-native' to
// 'react-native-web' so component source files (which import from
// 'react-native') resolve correctly in the Node.js test environment.
//
// Usage: node --import ./harness/register.js --test test-*.js

import { register } from 'node:module';

register('./resolve-hook.js', import.meta.url);
