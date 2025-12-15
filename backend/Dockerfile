# ===================================
# Kuma AI Backend - Dockerfile
# ===================================
# Multi-stage build for optimized production image

# ===================================
# Stage 1: Dependencies
# ===================================
FROM oven/bun:1.1-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --production=false

# ===================================
# Stage 2: Builder
# ===================================
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build TypeScript (if using tsc for build)
# RUN bun run build

# ===================================
# Stage 3: Production
# ===================================
FROM oven/bun:1.1-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kuma -u 1001 -G nodejs

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.ts ./
COPY --from=builder /app/worker.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create uploads directory
RUN mkdir -p uploads/temp uploads/chats && \
    chown -R kuma:nodejs uploads

# Switch to non-root user
USER kuma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Default command - run the server
CMD ["bun", "run", "index.ts"]

