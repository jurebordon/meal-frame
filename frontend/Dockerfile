# Frontend Dockerfile
# Development Dockerfile for Next.js application

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# Use npm install if no package-lock.json exists, otherwise use npm ci
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy application source
COPY . .

EXPOSE 3000

# Development mode (hot reload)
CMD ["npm", "run", "dev"]
