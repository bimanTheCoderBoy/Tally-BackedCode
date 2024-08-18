# Use the Docker image with DinD (Docker-in-Docker) support
FROM docker:24.0.6-dind

# Install Node.js, Docker CLI, and necessary compilers/runtimes
RUN apk add --no-cache \
    nodejs \
    npm \
    openjdk17 \
    gcc \
    g++ \
    python3 \
    git \
    bash

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Pull additional Docker images inside the container (for DinD)
RUN docker pull openjdk:18-slim \
    && docker pull python:3.10-slim \
    && docker pull gcc:latest

# Copy the rest of the application code
COPY . .

# Expose the necessary port
EXPOSE 3010
EXPOSE 10000

# Set environment variables (if needed)
ENV DOCKER_TLS_CERTDIR=/certs

# Bind Docker socket and set up volumes for DinD
VOLUME /var/run/docker.sock:/var/run/docker.sock
VOLUME /certs:/certs/client

# Start the Node.js application
CMD ["npm", "run", "dev"]
