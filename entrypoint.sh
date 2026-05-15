#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "
const p = require('postgres')(process.env.DATABASE_URL, {max:1});
p\`SELECT 1\`.then(() => { p.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  Database not ready, retrying in 2s..."
  sleep 2
done
echo "Database is ready."

echo "Running database migrations..."
npx drizzle-kit migrate 2>&1
echo "Migrations complete. Starting server..."
exec node server.js
