# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source
COPY tsconfig*.json ./
COPY nest-cli.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build NestJS app
RUN npm run build

# Stage 2: Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json + lock để hỗ trợ runtime tools (prisma client, class-validator, ...)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --omit=dev --workspace=apps/api

# Copy built app + prisma client
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma ./prisma

# Expose NestJS default port
EXPOSE 3000

# Command: chạy migrations (nếu có) rồi start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

