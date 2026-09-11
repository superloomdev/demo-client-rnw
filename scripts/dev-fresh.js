// Info: dev:fresh - starts the dev server only after verifying the port
// is free or has a matching identity. Refuses stale/conflicting ports and
// never silently switches to another port. Never kills processes.
import { checkDevServer } from './check-dev-server.js';
import { computeBuildIdentity } from './build-identity.js';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const PORT = 5173;

async function main () {
  const repoRoot = resolve(process.cwd());
  const expectedIdentity = computeBuildIdentity(repoRoot);

  const result = await checkDevServer(PORT, expectedIdentity);

  if (result.state === 'free') {
    console.log('Port ' + PORT + ' is free, starting dev server...');
  } else if (result.state === 'matching') {
    console.log('Port ' + PORT + ' has a matching dev server (PID ' + result.pid + ')');
    console.log('A fresh server is already running. Stop it first if you want to restart.');
    process.exit(0);
  } else {
    console.error('FAIL: ' + result.remedy);
    console.error('dev:fresh refuses to start on a stale/conflicting port.');
    console.error('Fix the port conflict manually - dev:fresh never auto-increments the port.');
    process.exit(1);
  }

  // Start the dev server on the configured port
  const child = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: resolve(repoRoot, 'hosts/web'),
    stdio: 'inherit'
  });

  child.on('exit', function (code) {
    process.exit(code || 0);
  });
}

main();
