# Multi-stage production Dockerfile for BookaPriest (Google Cloud Run compatible)
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy full source and build frontend (Vite)
COPY . .
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and backend server
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Cloud Run defaults to port 8080
EXPOSE 8080

# Start server
CMD ["node", "server/server.js"]
