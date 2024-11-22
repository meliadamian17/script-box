#!/bin/bash

set -e

echo "Starting setup..."

echo "Installing npm packages..."
npm install --force

echo "Running database migrations..."
npx prisma migrate dev --name init


echo "Building Docker images for code execution..."
docker compose build

echo "Creating an admin user..."
node src/utils/createAdminUser.mjs

echo "Setup complete."

