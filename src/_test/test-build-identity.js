// Info: Build identity tests (Plan 0156). The identity is a working-tree
// content hash, not a commit hash: it must change when tracked content
// changes and must not change when a commit lands with no content change.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const computePath = resolve(__dirname, '..', '..', 'scripts', 'build-identity.js');
const { computeBuildIdentity } = await import(computePath);

// Build a temp git repo fixture with one committed file
function makeRepo () {
  const dir = mkdtempSync(join(tmpdir(), 'identity-fixture-'));
  execSync('git init -q && git config user.email t@t && git config user.name t', { cwd: dir });
  mkdirSync(join(dir, 'hosts', 'web'), { recursive: true });
  writeFileSync(join(dir, 'file.txt'), 'one');
  execSync('git add -A . && git commit -qm init', { cwd: dir });
  return dir;
}

describe('build identity', () => {

  test('identity changes when a tracked file changes', () => {
    const dir = makeRepo();
    try {
      const before = computeBuildIdentity(dir);
      writeFileSync(join(dir, 'file.txt'), 'two');
      const after = computeBuildIdentity(dir);
      assert.notEqual(before, after, 'identity must change with working tree content');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('identity does not change after a no-content-change commit', () => {
    const dir = makeRepo();
    try {
      const before = computeBuildIdentity(dir);
      execSync('git commit -qm noop --allow-empty', { cwd: dir });
      const after = computeBuildIdentity(dir);
      assert.equal(before, after, 'identity must not depend on HEAD');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
