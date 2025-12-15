# ===================================
# Kuma AI Frontend - Dockerfile
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
RUN bun install --frozen-lockfile

# ===================================
# Stage 2: Builder
# ===================================
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_LIVEKIT_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL

# Build the application
RUN bun run build

# ===================================
# Stage 3: Production (NGINX)
# ===================================
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy public assets
COPY --from=builder /app/public /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

