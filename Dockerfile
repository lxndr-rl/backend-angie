# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for canvas (for PDF generation)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine

# Install runtime dependencies for canvas
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Change to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]
