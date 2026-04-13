#!/bin/sh
set -e

echo "=== Arya Estética startup ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: ${PORT:-3000}"

echo ""
echo "--- Running database migrations ---"
if npx prisma migrate deploy; then
  echo "✓ Migrations OK"
else
  echo "✗ Migration failed — check DATABASE_URL and database connectivity"
  exit 1
fi

echo ""
echo "--- Starting Next.js on port ${PORT:-3000} ---"
exec npm start
