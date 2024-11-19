# Base GCC image for C++
FROM gcc:latest

# Set working directory
WORKDIR /workspace

# Add necessary dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Default command
CMD ["sh", "-c", "g++ /workspace/program.cpp -o /workspace/program && /workspace/program"]

