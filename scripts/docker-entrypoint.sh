#!/bin/sh
set -e

echo "→ Aplicando migrations…"
./node_modules/.bin/tsx src/db/migrate.ts || {
  echo "⚠ Falha na migration. Iniciando mesmo assim (talvez já estejam aplicadas)."
}

echo "→ Iniciando Next.js…"
exec node server.js
