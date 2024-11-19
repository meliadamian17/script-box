#!/bin/bash

set -e

echo "Starting the server and Docker containers..."

docker compose up -d

npm run dev

