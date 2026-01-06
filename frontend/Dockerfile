# ===================================
# Kuma AI Frontend - Dockerfile
# ===================================
# Multi-stage build following Bun best practices

FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install

# Copy node_modules and build the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_LIVEKIT_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL

# Build the application
RUN bun run build

# Production stage with NGINX
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from prerelease
COPY --from=prerelease /usr/src/app/dist /usr/share/nginx/html

# Copy public assets if any
COPY --from=prerelease /usr/src/app/public /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

