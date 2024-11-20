#!/bin/bash

set -e

echo "Starting the server and Docker containers..."

docker compose up -d

NEXT_LINT=false npm run build

npm run start
