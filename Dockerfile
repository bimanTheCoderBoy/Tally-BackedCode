# Use an official Docker image with DinD support
FROM docker:24.0.6-dind

# Install Node.js, Docker CLI, and necessary compilers/runtimes
RUN apk add \
nodejs \
npm \
openjdk17 \
gcc \
g++ \
python3 \
git \
bash

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose the necessary port (assuming 3000 for your Node.js app)
EXPOSE 3010

# Start the Node.js application
CMD ["npm", "run","dev"]
