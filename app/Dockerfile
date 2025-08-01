# Use Node.js 18 as base image
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port 8081 (default Expo port)
EXPOSE 8081

# Start Expo development server
CMD ["expo", "start", "--web", "--host", "0.0.0.0"]