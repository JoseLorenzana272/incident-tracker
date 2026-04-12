# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest first — Docker caches this layer separately
COPY package*.json ./

# Install ALL deps (including dev) for potential build steps
RUN npm ci

# Copy source
COPY . .

# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init: proper PID 1 signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy only production deps from builder
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app source from builder
COPY --from=builder /app/src ./src

# Security: never run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Document the port (doesn't publish it)
EXPOSE 3000

# Health check so orchestrators know when the app is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
