#!/bin/sh
# Gera public/version.json com CalVer + commit hash.
# Tolera ausência de .git (build em CI/Docker sem repo).

set -e

OUT_DIR="public"
OUT_FILE="$OUT_DIR/version.json"

mkdir -p "$OUT_DIR"

VERSION=$(date -u +%Y.%m.%d.%H%M)
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
COMMIT="unknown"
BRANCH="unknown"

if [ -e ".git" ] && git rev-parse --git-dir >/dev/null 2>&1; then
  COMMIT=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "unknown")
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
elif [ -n "$GIT_COMMIT" ]; then
  COMMIT=$(echo "$GIT_COMMIT" | cut -c1-7)
  BRANCH="${GIT_BRANCH:-unknown}"
fi

cat > "$OUT_FILE" <<EOF
{
  "version": "$VERSION",
  "commit": "$COMMIT",
  "branch": "$BRANCH",
  "buildTime": "$BUILD_TIME"
}
EOF

echo "→ $OUT_FILE  v$VERSION · $COMMIT · $BRANCH"
