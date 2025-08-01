# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Create public/temp directory for file uploads
RUN mkdir -p public/temp

# Expose port 8000
EXPOSE 8000

# Start the application
CMD ["npm", "start"]