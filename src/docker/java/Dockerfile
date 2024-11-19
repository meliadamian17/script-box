# Base OpenJDK image
FROM openjdk:17-slim

# Set working directory
WORKDIR /workspace

# Add necessary dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Default command
CMD ["sh", "-c", "javac /workspace/Main.java && java -cp /workspace Main"]

