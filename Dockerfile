# ==========================================================
# ⚔️ PANIPAT: 1761 - PRODUCTION DOCKERFILE
# Multi-stage build for minimal container image footprint
# ==========================================================

# --- Stage 1: Build Environment ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all development and production dependencies
RUN npm ci

# Copy the complete source code
COPY . .

# Build the client static assets and compile the full-stack Express server
RUN npm run build

# --- Stage 2: Production Runtime Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install only production-level dependencies to minimize image size and attack surface
RUN npm ci --only=production

# Copy built assets and static directories from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose the default full-stack development and production ingress port
EXPOSE 3000

# Start the optimized Node production server
CMD ["npm", "start"]
