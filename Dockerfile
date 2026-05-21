# ---- Stage 1: Build frontend ------------------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# ---- Stage 2: Compile backend TypeScript ------------------------------------
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

# ---- Stage 3: Production runtime --------------------------------------------
FROM node:20-alpine
WORKDIR /app/backend

# Production dependencies only (no devDeps, no source, no build tools)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Compiled JS from stage 2
COPY --from=backend-build /app/backend/dist ./dist

# Pre-built resume index — generate locally first:
#   GEMINI_API_KEY=<key> npm run embed <resume.pdf>
COPY backend/data ./data

# Built frontend — served as static files by Express in production
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
