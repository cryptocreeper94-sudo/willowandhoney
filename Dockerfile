# ---- Build Client ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Build Server ----
FROM node:20-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build
# Prune dev dependencies so we can copy a clean node_modules to production
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
CMD ["npm", "start"]
