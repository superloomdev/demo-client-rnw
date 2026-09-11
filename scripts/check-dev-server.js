// Info: Stale dev-server checker. Inspects configured project ports and
// reports PID/port/remedy for stale servers. Never kills processes.
// Used by dev:fresh to refuse stale/conflicting ports.
import { createServer } from 'node:net';

// Default port for the web dev server
const DEFAULT_PORT = 5173;

// Check if a port is free (nothing listening)
function checkPortFree (port) {
  return new Promise(function (resolve) {
    const tester = createServer();
    tester.once('error', function () {
      resolve(false);
    });
    tester.once('listening', function () {
      tester.close(function () {
        resolve(true);
      });
    });
    tester.listen(port, '127.0.0.1');
  });
}

// Fetch the build identity from a running server's /__identity endpoint
async function fetchIdentity (port) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(function () {
      controller.abort();
    }, 2000);
    const response = await fetch('http://127.0.0.1:' + port + '/__identity', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.identity || null;
  } catch {
    return null;
  }
}

// Find the PID of a process listening on a port (platform-independent)
async function findPid (port) {
  try {
    const { execFile } = await import('node:child_process');
    return new Promise(function (resolve) {
      // Try lsof first (macOS/Linux)
      execFile('lsof', ['-ti', ':' + port], function (err, stdout) {
        if (!err && stdout.trim()) {
          resolve(stdout.trim().split('\n')[0]);
          return;
        }
        resolve(null);
      });
    });
  } catch {
    return null;
  }
}

// Check the dev server state: is the port free, or is a server running?
// If a server is running, does its identity match the expected identity?
// Returns { state, pid, identity, remedy }
// state: 'free' | 'matching' | 'mismatch' | 'occupied'
export async function checkDevServer (port, expectedIdentity) {
  const free = await checkPortFree(port);
  if (free) {
    return { state: 'free', pid: null, identity: null, remedy: null };
  }

  // Port is occupied - check if it's our dev server
  const identity = await fetchIdentity(port);
  const pid = await findPid(port);

  if (identity === null) {
    // Port is occupied but not by our dev server
    return {
      state: 'occupied',
      pid: pid,
      identity: null,
      remedy: 'Port ' + port + ' is occupied by a non-dev process (PID ' + pid + '). Free the port or use a different port.'
    };
  }

  if (expectedIdentity && identity !== expectedIdentity) {
    return {
      state: 'mismatch',
      pid: pid,
      identity: identity,
      remedy: 'Stale dev server on port ' + port + ' (PID ' + pid + ') has identity ' + identity + ', expected ' + expectedIdentity + '. Stop the process and restart.'
    };
  }

  return {
    state: 'matching',
    pid: pid,
    identity: identity,
    remedy: null
  };
}

// CLI entry point
async function main () {
  const port = parseInt(process.argv[2] || DEFAULT_PORT, 10);
  const expectedIdentity = process.argv[3] || null;

  const result = await checkDevServer(port, expectedIdentity);

  if (result.state === 'free') {
    console.log('Port ' + port + ' is free');
    process.exit(0);
  } else if (result.state === 'matching') {
    console.log('Port ' + port + ' has a matching dev server (PID ' + result.pid + ')');
    process.exit(0);
  } else {
    console.error('FAIL: ' + result.remedy);
    process.exit(1);
  }
}

// Export for testing
export { checkPortFree, fetchIdentity, findPid, DEFAULT_PORT };

// Run CLI if invoked directly
if (import.meta.url === 'file://' + process.argv[1]) {
  main();
}
