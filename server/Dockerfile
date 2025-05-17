FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Copy source files
COPY shared/ ./shared/
COPY server/ ./server/
COPY tsconfig.json ./

# Install dependencies
RUN npm ci
RUN cd shared && npm ci
RUN cd server && npm ci

# Build shared library
RUN cd shared && npm run build

# Build server
RUN cd server && npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared/package*.json ./shared/
COPY --from=builder /app/server/package*.json ./server/

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

# Install production dependencies only
RUN npm ci --only=production
RUN cd shared && npm ci --only=production
RUN cd server && npm ci --only=production

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/dist/server.js"] 