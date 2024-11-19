# Base Node.js image
FROM node:16-slim

# Set working directory
WORKDIR /workspace

# Add necessary dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Default command
CMD ["node"]

