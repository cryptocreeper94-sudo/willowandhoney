# ---- Build Client ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Build Server ----
FROM node:20-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build
RUN npm prune --production

# ---- Production ----
FROM node:20-alpine
WORKDIR /app
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=client-builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/services || exit 1

CMD ["node", "dist/index.js"]
