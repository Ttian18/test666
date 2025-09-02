FROM node:18-alpine

# Install OpenSSL and curl for Prisma compatibility and health checks
RUN apk add --no-cache openssl curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/schema/package*.json ./packages/schema/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/schema ./packages/schema/
COPY packages/server ./packages/server/

# Build schema first
WORKDIR /app/packages/schema
RUN npm run build

# Setup server
WORKDIR /app/packages/server

# Generate Prisma client
RUN npx prisma generate

# Create directories for uploads and logs
RUN mkdir -p uploads logs

EXPOSE 5001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Start server (migrations can be run manually if needed)
CMD ["npm", "run", "dev"]
