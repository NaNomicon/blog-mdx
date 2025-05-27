# Ultra-fast build optimized for minimum time and multi-platform compatibility
FROM node:20-alpine AS base

# Install pnpm and setup in one optimized layer
RUN npm install -g pnpm@9.5.0 && \
    apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/* && \
    pnpm config set store-dir /root/.local/share/pnpm/store

WORKDIR /app

# Dependencies stage with aggressive caching
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

# Install with maximum caching and parallelism
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# Builder stage optimized for speed
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files at once for faster layer creation
COPY . .

# Build with maximum optimization for speed
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=6144" \
    NEXT_PRIVATE_SKIP_VALIDATION=1

# Build with aggressive caching
RUN --mount=type=cache,id=nextjs,target=/app/.next/cache \
    --mount=type=cache,id=swc,target=/root/.swc \
    pnpm build

# Ultra-minimal production image
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV PORT=3001 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME="0.0.0.0"

EXPOSE 3001

CMD ["server.js"]