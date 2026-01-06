# ===================================
# Kuma AI Backend - Dockerfile
# ===================================
# Multi-stage build following Bun best practices

FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Set production environment
ENV NODE_ENV=production

# Copy production dependencies and source code into final image
FROM base AS production
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prerelease /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=prerelease /usr/src/app/prisma ./prisma
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/package.json .

# Create uploads directory
RUN mkdir -p uploads/temp uploads/chats && \
    chown -R bun:bun uploads

# Run as non-root user
USER bun

# Expose port
EXPOSE 3001

# No health check - will rely on container running status
# Health checks require curl/wget which aren't in base image

# Run the app
ENTRYPOINT ["bun", "run", "index.ts"]

