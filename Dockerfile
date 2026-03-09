# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app
RUN npm run build

# Stage 2: Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json + lock để hỗ trợ runtime tools (prisma client, class-validator, ...)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app + prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose NestJS default port
EXPOSE 3000

# Command: chạy migrations (nếu có) rồi start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
