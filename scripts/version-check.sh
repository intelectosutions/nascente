#!/bin/sh
# Compara versão local (HEAD) com produção e mostra status sync.

set -e

PROD_URL="${PROD_VERSION_URL:-https://nascente.intelecto.solutions/api/version}"

if [ -e ".git" ] && git rev-parse --git-dir >/dev/null 2>&1; then
  LOCAL_COMMIT=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "unknown")
  LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
else
  LOCAL_COMMIT="unknown"
  LOCAL_BRANCH="unknown"
fi
LOCAL_VERSION=$(date -u +%Y.%m.%d.%H%M)

PROD_JSON=$(curl -s --max-time 5 "$PROD_URL" 2>/dev/null || echo "")
if [ -z "$PROD_JSON" ]; then
  echo "Local:  v$LOCAL_VERSION  ·  $LOCAL_COMMIT  ·  $LOCAL_BRANCH"
  echo "Prod:   inacessível ($PROD_URL)"
  exit 0
fi

PROD_VERSION=$(echo "$PROD_JSON" | sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
PROD_COMMIT=$(echo "$PROD_JSON" | sed -n 's/.*"commit"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
PROD_BRANCH=$(echo "$PROD_JSON" | sed -n 's/.*"branch"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

echo "Local:  v$LOCAL_VERSION  ·  $LOCAL_COMMIT  ·  $LOCAL_BRANCH"
echo "Prod:   v$PROD_VERSION  ·  $PROD_COMMIT  ·  $PROD_BRANCH"

if [ "$LOCAL_COMMIT" = "$PROD_COMMIT" ]; then
  echo "✓ Sincronizado"
else
  if git rev-list --count "$PROD_COMMIT..$LOCAL_COMMIT" >/dev/null 2>&1; then
    AHEAD=$(git rev-list --count "$PROD_COMMIT..$LOCAL_COMMIT" 2>/dev/null || echo "?")
    BEHIND=$(git rev-list --count "$LOCAL_COMMIT..$PROD_COMMIT" 2>/dev/null || echo "?")
    if [ "$AHEAD" -gt 0 ] 2>/dev/null && [ "$BEHIND" = "0" ]; then
      echo "⚠ Local $AHEAD commit(s) à frente de prod (trabalho não deployado)"
    elif [ "$BEHIND" -gt 0 ] 2>/dev/null && [ "$AHEAD" = "0" ]; then
      echo "⚠ Local $BEHIND commit(s) atrás de prod (precisa pull)"
    else
      echo "⚠ Local e prod divergiram (+$AHEAD / -$BEHIND)"
    fi
  fi
fi
