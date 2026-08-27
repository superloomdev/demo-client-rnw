// Info: Custom Node.js ESM loader hook.
//
// Redirects bare specifier imports to packages installed in _test/node_modules.
// The app source files live in src/ (outside _test/), so Node's ESM resolver
// cannot find these packages without this hook. In CJS, NODE_PATH handled
// this; ESM has no equivalent.

import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDir = path.resolve(__dirname, '..');
const require = createRequire(testDir + '/');

// Packages that src/ imports but are only installed in _test/node_modules
const REDIRECTS = [
  'react',
  'react-dom',
  'react-native',
  'react-native-safe-area-context',
  'react-test-renderer',
  '@superloomdev/js-helper-utils',
  '@superloomdev/js-helper-debug',
  '@superloomdev/js-client-helper-themer',
  '@superloomdev/js-client-helper-themer-ext-react',
  '@superloomdev/js-client-helper-font',
  '@superloomdev/rnw-components-carbon'
];

const redirectURLs = {};
for (const pkg of REDIRECTS) {
  try {
    const resolved = require.resolve(pkg);
    redirectURLs[pkg] = pathToFileURL(resolved).href;
  } catch {
    // Package not installed; skip
  }
}


export function resolve (specifier, context, nextResolve) {

  // Check exact match first
  if (redirectURLs[specifier]) {
    return {
      shortCircuit: true,
      url: redirectURLs[specifier]
    };
  }

  // Check scoped package matches (e.g. @superloomdev/js-helper-utils/data/x.json)
  for (const pkg of Object.keys(redirectURLs)) {
    if (specifier === pkg || specifier.startsWith(pkg + '/')) {
      try {
        const resolved = require.resolve(specifier);
        return {
          shortCircuit: true,
          url: pathToFileURL(resolved).href
        };
      } catch {
        // Fall through to default resolver
      }
    }
  }

  return nextResolve(specifier, context);

}
