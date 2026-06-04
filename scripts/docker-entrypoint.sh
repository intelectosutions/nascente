#!/bin/sh
set -e

echo "→ Aplicando migrations…"
node scripts/migrate.mjs || {
  echo "⚠ Falha na migration — abortando." >&2
  exit 1
}

echo "→ Iniciando Next.js…"
exec node server.js
