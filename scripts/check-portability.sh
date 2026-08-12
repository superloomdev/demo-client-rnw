#!/usr/bin/env bash
# Info: Static portability fence for shared source.
# Catches framework coupling at commit time, faster than a build.
# Never weaken this script. Fix the source instead.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$REPO_ROOT/src"
STATUS=0
OFFENDERS=""

# 1. A file under src/ imports or requires a package matching ^expo or ^@expo/
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rnE "(import|require)\(.*['\"]@?expo" "$SRC_DIR" --exclude-dir=node_modules --exclude="test-smoke.js" 2>/dev/null || true)

# 2. A file under src/ references a path containing hosts/
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rn "hosts/" "$SRC_DIR" --exclude-dir=node_modules 2>/dev/null || true)

# 3. A file under src/ references a vendor-named slot: Lib.Expo, shared_libs.Expo, Lib.MMKV, shared_libs.MMKV
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rnE "(Lib|shared_libs)\.(Expo|MMKV)" "$SRC_DIR" --exclude-dir=node_modules 2>/dev/null || true)

# 4. Any tracked file contains 'eas build' or 'eas update'
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(git -C "$REPO_ROOT" grep -n -E "eas (build|update)" -- ':!scripts/check-portability.sh' 2>/dev/null || true)

# 5. A file under src/ references the old vendor-named icon slot Lib.Icons.Ionicons
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rn "Lib\.Icons\.Ionicons" "$SRC_DIR" --exclude-dir=node_modules 2>/dev/null || true)

# 6. The lib-context provider uses the old shared_libs prop instead of adapters
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rn "props\.shared_libs" "$SRC_DIR" --exclude-dir=node_modules 2>/dev/null || true)

# 7. A file under src/ other than src/themes/assemble.js contains platform: 'native'
while IFS= read -r line; do
  OFFENDERS="${OFFENDERS}${line}"$'\n'
  STATUS=1
done < <(grep -rn "platform: 'native'" "$SRC_DIR" --exclude-dir=node_modules --exclude="assemble.js" 2>/dev/null || true)

if [ "$STATUS" -ne 0 ]; then
  echo "portability: FAIL"
  echo ""
  echo "Offenders:"
  echo "$OFFENDERS"
  exit 1
fi

echo "portability: OK"
exit 0
