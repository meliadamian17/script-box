# Use the official Docker-in-Docker image as the base
FROM docker:24-dind

# Install Node.js and other necessary dependencies
RUN apk update && \
    apk add --no-cache nodejs npm git python3 make g++ bash wget curl

# Install Docker Compose as a Docker CLI plugin
RUN mkdir -p /usr/lib/docker/cli-plugins/ && \
    curl -SL https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-linux-x86_64 -o /usr/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/lib/docker/cli-plugins/docker-compose

# Verify that docker compose is installed
RUN docker compose version

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the rest of your application code
COPY . .

# Ensure your scripts have execute permissions
RUN chmod +x startup.sh run.sh

# Expose the necessary port (default for Next.js)
EXPOSE 3000

# Start the Docker daemon and run your scripts
CMD ["sh", "-c", "dockerd-entrypoint.sh & sleep 5 && ./startup.sh && ./run.sh"]

