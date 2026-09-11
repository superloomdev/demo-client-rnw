// Info: Build identity computation. SHA-256 of Git HEAD for the demo
// client repo, combined with SHA-256 of hosts/web/package-lock.json.
// Used by Vite define, the /__identity endpoint, and readiness tests.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

// Compute the build identity for the demo client repo.
// Returns a hex string: sha256(git-head) + sha256(package-lock.json)
export function computeBuildIdentity (repoRoot) {
  const root = repoRoot || process.cwd();

  // SHA-256 of Git HEAD
  let gitHeadSha;
  try {
    const headRef = execSync('git -C ' + root + ' rev-parse HEAD', { encoding: 'utf8' }).trim();
    gitHeadSha = createHash('sha256').update(headRef).digest('hex');
  } catch {
    // If not in a git repo, use the directory hash
    gitHeadSha = createHash('sha256').update(root).digest('hex');
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

  return gitHeadSha.substring(0, 16) + lockSha.substring(0, 16);
}
