#!/bin/sh
set -e

echo "=== Arya Estética startup ==="

echo "--- Running migrations ---"
npx prisma migrate deploy
echo "✓ Migrations OK"

echo "--- Running seed (idempotente) ---"
npm run seed
echo "✓ Seed OK"

echo "--- Starting Next.js ---"
exec npm start
