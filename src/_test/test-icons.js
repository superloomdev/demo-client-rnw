// Info: Icon manifest coverage test
//
// Every icon-name string literal under src/ must resolve through the
// semantic icon manifest shipped by @superloomdev/rnw-components. A name
// that is neither a manifest key nor a declared alias renders the '?'
// fallback glyph on web and warns on Expo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const SRC_DIR = join(REPO_ROOT, 'src');

// Files allowed to hold non-icon name literals
const EXCLUDED = new Set([
  join(SRC_DIR, 'themes', 'brand-layers.js'),
  join(SRC_DIR, 'app-core', 'contexts', 'theme-context.js')
]);

const manifest = JSON.parse(readFileSync(
  join(__dirname, 'node_modules', '@superloomdev', 'rnw-components', 'data', 'icon-names.json'),
  'utf8'
));

// Canonical names plus every declared alias
const VALID_NAMES = new Set();
for (const [name, entry] of Object.entries(manifest.icons)) {
  VALID_NAMES.add(name);
  for (const alias of entry.aliases || []) {
    VALID_NAMES.add(alias);
  }
}

const ICON_PROP = /\b(?:icon|iconName|name|leftIcon|rightIcon)\s*[:=]\s*['"]([a-z][a-z0-9_-]*)['"]/g;

function collect () {
  const offenders = [];

  function walk (dir) {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '_test') {
        continue;
      }
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.endsWith('.js') || EXCLUDED.has(full)) {
        continue;
      }
      const content = readFileSync(full, 'utf8');
      for (const match of content.matchAll(ICON_PROP)) {
        if (!VALID_NAMES.has(match[1])) {
          offenders.push(match[1] + '  ' + relative(REPO_ROOT, full));
        }
      }
    }
  }

  walk(SRC_DIR);
  return offenders;
}

test('every icon name literal in src/ resolves through the icon manifest', function () {
  assert.deepEqual(collect(), []);
});
