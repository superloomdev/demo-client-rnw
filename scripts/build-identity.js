// Info: Build identity computation. SHA-256 of the working tree content
// (tracked files, hashed through a temporary git index so the real index is
// untouched), combined with SHA-256 of hosts/web/package-lock.json.
// Used by Vite define, the /__identity endpoint, and readiness tests.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, mkdtempSync, rmSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

// Compute the build identity for the demo client repo.
// Returns a hex string: sha256(git-tree) + sha256(package-lock.json)
export function computeBuildIdentity (repoRoot) {
  const root = repoRoot || process.cwd();

  // SHA-256 of the working tree content. A temp GIT_INDEX_FILE snapshots
  // tracked content without touching the real index or requiring a commit.
  let gitTreeSha;
  const tmpDir = mkdtempSync(join(tmpdir(), 'build-identity-'));
  const tmpIndex = join(tmpDir, 'index');
  try {
    const env = Object.assign({}, process.env, { GIT_INDEX_FILE: tmpIndex });
    execSync('git -C ' + root + ' add -A .', { env: env });
    const treeId = execSync('git -C ' + root + ' write-tree', { env: env, encoding: 'utf8' }).trim();
    gitTreeSha = createHash('sha256').update(treeId).digest('hex');
  } catch {
    // If not in a git repo, use the directory hash
    gitTreeSha = createHash('sha256').update(root).digest('hex');
  } finally {
    try {
      unlinkSync(tmpIndex);
    } catch {
      // Temp index may not exist if git add failed
    }
    rmSync(tmpDir, { recursive: true, force: true });
  }

  // SHA-256 of hosts/web/package-lock.json
  const lockPath = resolve(root, 'hosts/web/package-lock.json');
  let lockSha;
  if (existsSync(lockPath)) {
    const lockContent = readFileSync(lockPath, 'utf8');
    lockSha = createHash('sha256').update(lockContent).digest('hex');
  } else {
    lockSha = createHash('sha256').update('no-lockfile').digest('hex');
  }

  return gitTreeSha.substring(0, 16) + lockSha.substring(0, 16);
}
