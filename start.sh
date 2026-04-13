#!/bin/sh
set -e

echo "=== Arya Estética startup ==="

echo "--- Running migrations ---"
npx prisma migrate deploy
echo "✓ Migrations OK"

echo "--- Running seed ---"
npm run seed && echo "✓ Seed OK" || echo "⚠ Seed falló (puede que ya tenga datos o error de conexión)"

echo "--- Starting Next.js ---"
exec npm start
