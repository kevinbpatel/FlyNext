#!/bin/bash
set -e

echo "Start Seeding cities and airports..."
docker compose exec flynext node scripts/seed-locations.js

echo "Seeding hotels data..."
docker compose exec flynext node scripts/seed-hotels.js

echo "Data seeding completed successfully!"