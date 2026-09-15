// Info: Expo icon adapter path-data assertions (M.6)
//
// Asserts that every semantic icon name in the manifest resolves to a
// non-empty path data string from @carbon/icons. This is the entire point
// of the M-D3 change: path data makes native icon rendering verifiable
// without a device.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolveIconPaths } from '../adapters/icon-paths.js';

const require = createRequire(import.meta.url);
const manifest = require('@superloomdev/rnw-components/data/icon-names.json');

test('every manifest icon name resolves to a non-empty d string', () => {
  const names = Object.keys(manifest.icons);
  assert.ok(names.length >= 43, 'expected at least 43 icons, got ' + names.length);

  const failures = [];
  for (const name of names) {
    const paths = resolveIconPaths(name, 16);
    if (!paths || !paths.length) {
      failures.push(name + ': no path data resolved');
    } else {
      for (let i = 0; i < paths.length; i++) {
        if (!paths[i] || !paths[i].length) {
          failures.push(name + ' path[' + i + ']: empty d string');
        }
      }
    }
  }

  assert.ok(!failures.length,
    'icon path-data failures:\n  ' + failures.join('\n  '));
});

test('icon sizes 16/20/24/32 all resolve for close', () => {
  for (const size of [16, 20, 24, 32]) {
    const paths = resolveIconPaths('close', size);
    assert.ok(paths && paths.length,
      'close@' + size + ' should resolve to non-empty path data');
  }
});
