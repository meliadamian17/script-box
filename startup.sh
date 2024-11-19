#!/bin/bash

set -e

echo "Starting setup..."

echo "Installing npm packages..."
npm install --force

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Checking for required compilers/interpreters..."

# check_command() {
#     if ! command -v "$1" &> /dev/null; then
#         echo "Error: $1 is not installed. Please install $1 and try again."
#         exit 1
#     else
#         echo "$1 is installed."
#     fi
# }
#
# check_command docker
# check_command gcc
# check_command g++
# check_command python3
# check_command node
# check_command javac
# check_command java

echo "Building Docker images for code execution..."
docker compose build

echo "Creating an admin user..."
node src/utils/createAdminUser.mjs

echo "Setup complete."

