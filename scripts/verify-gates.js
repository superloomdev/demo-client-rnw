// Info: Local CI parity gate. The workflow declares 26 enforcement gates as
// inline `git grep` steps, which means they are runnable only by pushing. This
// script extracts those steps straight out of ci.yml and runs them locally.
//
// Extraction rather than duplication is deliberate: a hand-mirrored copy of 26
// greps would drift from the workflow the first time a gate changed, and a
// drifted mirror is worse than no mirror because it reports false confidence.
// The workflow stays the single source of truth for what a gate asserts.
//
// Usage:
//   node scripts/verify.js           gates + lint + unit tests
//   node scripts/verify.js --gates   enforcement gates only
//   node scripts/verify.js --full    adds the L3 esbuild + Playwright tier

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = path.join(REPO_ROOT, '.github', 'workflows', 'ci.yml');

const GATES_ONLY = process.argv.includes('--gates');
const FULL = process.argv.includes('--full');


/********************************************************************
Extract every enforcement gate step from the workflow file.

A step looks like:

      - name: G1 - No accessibilityState
        run: |
          <command lines indented further>

@return {Array} - List of { name, script } in workflow order
*********************************************************************/
function getGates () {

  const lines = readFileSync(WORKFLOW, 'utf8').split('\n');
  const gates = [];

  for (let i = 0; i < lines.length; i++) {

    // A gate begins at a step whose name starts with G followed by digits
    const header = lines[i].match(/^(\s+)- name: (G\d+\b.*)$/);
    if (!header) {
      continue;
    }

    // The run block must be the next non-blank line, otherwise the step is
    // something other than an inline script and cannot be replayed
    const runLine = lines[i + 1];
    if (!runLine || !/^\s+run: \|/.test(runLine)) {
      continue;
    }

    // Collect the block: every line indented deeper than the run key itself
    const runIndent = runLine.match(/^(\s+)/)[1].length;
    const body = [];

    for (let j = i + 2; j < lines.length; j++) {
      const line = lines[j];
      if (!line.trim()) {
        body.push('');
        continue;
      }
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent <= runIndent) {
        break;
      }
      body.push(line);
    }

    // Strip the common leading indentation so the script runs as written
    const dedent = Math.min.apply(null, body
      .filter(function (l) {
        return Boolean(l.trim());
      })
      .map(function (l) {
        return l.match(/^(\s*)/)[1].length;
      })
    );

    gates.push({
      name: header[2].trim(),
      script: body.map(function (l) {
        return l.slice(dedent);
      }).join('\n')
    });

  }

  // Return the gates in the order the workflow declares them
  return gates;

}


/********************************************************************
Run one named check and record the outcome without stopping the run.

@param {String}   name - Human-readable gate name
@param {Function} fn   - Thunk that throws on failure

@return {Boolean} - True when the check passed
*********************************************************************/
function runCheck (name, fn) {

  process.stdout.write('\n\x1b[1m=== ' + name + ' ===\x1b[0m\n');

  try {
    fn();
    process.stdout.write('\x1b[32mPASS\x1b[0m ' + name + '\n');
    // Report success to the caller
    return true;
  } catch {
    process.stdout.write('\x1b[31mFAIL\x1b[0m ' + name + '\n');
    // Report failure to the caller
    return false;
  }

}


// Run a shell command from the repo root, surfacing its output on failure
function sh (cmd, cwd) {
  execSync(cmd, {
    cwd: cwd || REPO_ROOT,
    stdio: 'inherit'
  });
}


// ------------------------------- Run ---------------------------------- //

const gates = getGates();

if (gates.length < 1) {
  process.stdout.write('\x1b[31mFAIL\x1b[0m no gates extracted from ci.yml; the step format changed\n');
  process.exit(1);
}

process.stdout.write('extracted ' + gates.length + ' enforcement gates from ci.yml\n');

// Every gate is a `git grep`, which searches tracked content only. An untracked
// file is invisible to all of them, so a clean local run says nothing about a
// file that has not been staged yet, while CI sees it the moment it is pushed.
// This exact blind spot let a G26 violation in this script reach CI.
const untracked = execSync('git ls-files --others --exclude-standard', {
  cwd: REPO_ROOT, encoding: 'utf8'
}).trim();

if (untracked) {
  process.stdout.write(
    '\n\x1b[31mFAIL\x1b[0m untracked files are invisible to git grep gates.\n' +
    'Use git add -N on each intended file before trusting verification:\n'
  );
  for (const file of untracked.split('\n')) {
    process.stdout.write('  ' + file + '\n');
  }
  process.exit(1);
}

const failed = [];
let passed = 0;

for (const gate of gates) {
  const ok = runCheck(gate.name, function () {
    sh(gate.script);
  });
  if (ok) {
    passed++;
  } else {
    failed.push(gate.name);
  }
}

if (!GATES_ONLY) {

  if (runCheck('clean install', function () {
    sh('rm -rf node_modules package-lock.json _test/node_modules _test/package-lock.json && ' +
      'npm install && (cd _test && npm install)');
  })) {
    passed++;
  } else {
    failed.push('clean install');
  }

  if (runCheck('eslint', function () {
    sh('npx eslint .');
  })) {
    passed++;
  } else {
    failed.push('eslint');
  }

  if (runCheck('unit tests (_test)', function () {
    sh('npm test', path.join(REPO_ROOT, '_test'));
  })) {
    passed++;
  } else {
    failed.push('unit tests (_test)');
  }

  if (FULL) {
    if (runCheck('L3 visual + interaction', function () {
      sh('npm run test:l3', path.join(REPO_ROOT, '_test'));
    })) {
      passed++;
    } else {
      failed.push('L3 visual + interaction');
    }
  }

}


// ----------------------------- Summary -------------------------------- //

process.stdout.write('\n\x1b[1m=== Summary ===\x1b[0m\n');
process.stdout.write('passed: ' + passed + '\n');

if (failed.length >= 1) {
  process.stdout.write('\x1b[31mfailed:\x1b[0m\n');
  for (const name of failed) {
    process.stdout.write('  - ' + name + '\n');
  }
  process.exit(1);
}

process.stdout.write('\x1b[32mall gates passed\x1b[0m\n');
