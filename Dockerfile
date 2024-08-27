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

# Copy the rest of the application code
COPY . .

# Install OpenJDK 18 from the official slim image
# RUN curl -o openjdk-18-slim.tar.gz https://download.bell-sw.com/java/18/bellsoft-jdk18.0.2.1-linux-amd64-musl.tar.gz \
#     && mkdir /opt/openjdk-18 \
#     && tar -xzf openjdk-18-slim.tar.gz -C /opt/openjdk-18 --strip-components=1 \
#     && rm openjdk-18-slim.tar.gz

# # Set environment variables for OpenJDK 18
# ENV JAVA_HOME=/opt/openjdk-18
# ENV PATH="$JAVA_HOME/bin:$PATH"

# Expose the necessary port
EXPOSE 3010
EXPOSE 10000
EXPOSE 8080


# Set environment variables (if needed)
ENV DOCKER_TLS_CERTDIR=/certs

# Bind Docker socket and set up volumes for DinD
VOLUME /var/run/docker.sock:/var/run/docker.sock
VOLUME /certs:/certs/client
VOLUME /:/app

# Start the Node.js application
CMD ["npm", "run", "dev"]
