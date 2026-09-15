#!/usr/bin/env bash
# Info: Tracked-snapshot gate (G28).
#
# Fails when git ls-files reports any file under an *-snapshots/ directory
# whose name does not end in -linux.png. Darwin (macOS) snapshots are
# tracked-platform artifacts that CI on Linux cannot reproduce; they must
# be gitignored, not committed.
#
# Usage: bash scripts/check-snapshots.sh

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

non_linux=$(git ls-files | grep -- '-snapshots/' | grep -v -- '-linux\.png$' || true)

if [ -n "$non_linux" ]; then
  echo "FAIL G28: tracked non-Linux snapshot files found:"
  echo "$non_linux"
  echo ""
  echo "These files are platform-specific artifacts that CI on Linux cannot"
  echo "reproduce. Remove them with: git rm --cached <file>"
  echo "Then add the pattern to .gitignore."
  exit 1
fi

echo "PASS G28: no tracked non-Linux snapshots"
