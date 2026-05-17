# Build stage — compile frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copy backend
COPY backend ./backend
WORKDIR /app/backend
RUN npm install && npm run build && npm prune --production

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
