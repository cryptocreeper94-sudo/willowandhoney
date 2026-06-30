# ---- Build Client ----
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Build Server ----
FROM node:18-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# ---- Production ----
FROM node:18-alpine
WORKDIR /app
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/src/db/sqlite.db ./server/dist/db/sqlite.db 
COPY --from=client-builder /app/client/dist ./client/dist

WORKDIR /app/server
RUN npm install --production

EXPOSE 3000
CMD ["node", "dist/index.js"]
