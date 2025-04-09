

#!/bin/bash
set -e

# Delete public upload folders for hotel and user if they exist
echo "Deleting public upload folders..."
rm -rf public/upload/hotel
rm -rf public/upload/user

# Install dependencies
echo "Installing dependencies..."
npm install

# Reset database and apply schema
echo "Initializing database..."
npx prisma db push --force-reset

# Generate Prisma client first
echo "Generating Prisma Client..."
npx prisma generate

# Seed data - execute scripts in sequence
echo "Start Seeding cities and airports..."
node scripts/seed-locations.js

# echo "Start Seeding hotels..."
# node scripts/seed-hotels.js

echo "Setup completed successfully!"
