#!/usr/bin/env bash
# Info: Replays one CI job from a snapshot of the working tree as git sees it:
# tracked files plus untracked non-ignored files, nothing else. This is what
# a bare checkout of the commit-to-be looks like, so an install a sibling
# package performed on this workstation cannot leak into the replay.
#
#   bash scripts/verify-isolated.sh <working-directory> <command...>
#   e.g. bash scripts/verify-isolated.sh src/_test 'npm ci --cache "$(mktemp -d)" && npm test'
set -euo pipefail
REPO_ROOT="$(git rev-parse --show-toplevel)"
JOB_DIR="$1"
shift
SNAP="$(mktemp -d "${TMPDIR:-/tmp}/verify-isolated-XXXXXX")"
cleanup () { rm -rf "$SNAP"; }
trap cleanup EXIT

while IFS= read -r -d '' f; do
  if [ -f "$REPO_ROOT/$f" ]; then
    mkdir -p "$SNAP/$(dirname "$f")"
    cp -p "$REPO_ROOT/$f" "$SNAP/$f"
  fi
done < <(git -C "$REPO_ROOT" ls-files -z --cached --others --exclude-standard)

if [ -d "$SNAP/hosts/web/node_modules" ] || [ -d "$SNAP/node_modules" ]; then
  echo "FAIL isolated: snapshot contains an installed tree; .gitignore is not excluding it"
  exit 1
fi

echo "isolated replay: $JOB_DIR :: $*"
( cd "$SNAP/$JOB_DIR" && bash -c "$*" )
