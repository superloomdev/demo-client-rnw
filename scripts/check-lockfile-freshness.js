// Info: Lockfile freshness gate
//
// Every @superloomdev package is republished at a pinned version, which
// changes the tarball shasum while the version string stays the same. A
// lockfile written against the previous publish pins a resolved URL whose
// trailing shasum the registry no longer serves, and a warm local npm cache
// hides the failure. This gate compares each pinned resolved shasum against
// the shasum the registry reports for that exact name and version.
//
// Usage: node scripts/check-lockfile-freshness.js
// Exit 0: every pin matches the registry. Exit 1: one line per stale pin.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = 'https://npm.pkg.github.com';
const SCOPE_PREFIX = 'node_modules/@superloomdev/';

const LOCKFILES = [
  'package-lock.json',
  'src/_test/package-lock.json',
  'hosts/web/package-lock.json',
  'hosts/expo/package-lock.json'
];

// The resolved tarball URL carries the tarball shasum as its last segment
function shasumFromTarballUrl (url) {
  const tail = String(url || '').split('/').pop();
  return tail || '';
}

// Ask the registry which tarball it serves for name@version, cached per pin
const tarballCache = {};

function registryTarball (name, version) {
  const key = name + '@' + version;
  if (!(key in tarballCache)) {
    try {
      const out = execSync(
        'npm view ' + key + ' dist.tarball --json --registry=' + REGISTRY,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
      ).trim();
      tarballCache[key] = JSON.parse(out);
    } catch {
      tarballCache[key] = null;
    }
  }
  return tarballCache[key];
}

const mismatches = [];
let checked = 0;

for (const rel of LOCKFILES) {
  const lockPath = path.join(REPO_ROOT, rel);
  if (!existsSync(lockPath)) {
    continue;
  }
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  const packages = lock.packages || {};
  for (const key of Object.keys(packages)) {
    if (!key.startsWith(SCOPE_PREFIX)) {
      continue;
    }
    const entry = packages[key];
    if (!entry.version || !entry.resolved) {
      continue;
    }
    // Nested installs appear as node_modules/@scope/pkg/node_modules/dep -
    // only the last segment names the package this entry pins
    const name = key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
    if (!name.startsWith('@superloomdev/')) {
      continue;
    }
    const tarball = registryTarball(name, entry.version);
    const pinned = shasumFromTarballUrl(entry.resolved);
    const registry = tarball ? shasumFromTarballUrl(tarball) : 'unavailable';
    checked++;
    if (pinned !== registry) {
      mismatches.push(rel + '  ' + name + '@' + entry.version + '  pinned=' + pinned + '  registry=' + registry);
    }
  }
}

if (mismatches.length > 0) {
  for (const line of mismatches) {
    process.stdout.write(line + '\n');
  }
  process.exit(1);
}

process.stdout.write('lockfile freshness: OK (' + checked + ' pins checked)\n');
