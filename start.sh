#!/bin/sh
set -e

echo "=== Arya Estética startup ==="
echo "NODE_ENV: $NODE_ENV"

echo ""
echo "--- Running database migrations ---"
npx prisma migrate deploy
echo "✓ Migrations OK"

echo ""
echo "--- Checking if seed is needed ---"
node -e "
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./lib/generated/prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

db.service.count().then(count => {
  if (count === 0) {
    console.log('Database empty — running seed...');
    process.exit(2);
  } else {
    console.log('Database already seeded (' + count + ' services). Skipping.');
    process.exit(0);
  }
}).catch(err => {
  console.error('Seed check failed:', err.message);
  process.exit(0);
});
" && SEED_NEEDED=0 || SEED_NEEDED=$?

if [ "$SEED_NEEDED" = "2" ]; then
  npm run seed
  echo "✓ Seed completado"
fi

echo ""
echo "--- Starting Next.js ---"
exec npm start
