# ============================================
# ZeroWaste OS - Backend Dockerfile
# Node.js + Express + TypeScript
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --silent --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S zerowaste -u 1001

USER zerowaste

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
