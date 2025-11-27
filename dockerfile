# Use a small, secure base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the app port (Render uses $PORT automatically)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the backend
CMD ["node", "backend.js"]
