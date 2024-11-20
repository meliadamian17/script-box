#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting setup..."

echo "Installing npm packages..."
npm install --force

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Installing Docker and Docker Compose..."

# Update system and install prerequisites
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker’s official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index and install Docker
sudo apt-get update
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Verify Docker installation
echo "Verifying Docker installation..."
sudo docker --version
sudo docker compose version

# Ensure the user has permissions to use Docker
echo "Adding current user to the Docker group..."
sudo usermod -aG docker $USER

echo "Building Docker images for code execution..."
docker compose build

echo "Creating an admin user..."
node src/utils/createAdminUser.mjs

echo "Setup complete."

