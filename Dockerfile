# --------------------------------------------------
# Stage 1: Build the React frontend
# --------------------------------------------------
FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# --------------------------------------------------
# Stage 2: Build the Express backend
# --------------------------------------------------
FROM node:22-bookworm-slim AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Prisma's configuration reads DATABASE_URL_UNPOOLED.
# Client generation does not require a live database,
# so provide a build-only placeholder if it is absent.
RUN DATABASE_URL_UNPOOLED="${DATABASE_URL_UNPOOLED:-postgresql://build:build@localhost:5432/build}" \
    npx prisma generate --config prisma7.config.ts

# Compile the TypeScript backend.
RUN npm run build

# Remove development dependencies from the builder.
RUN npm prune --omit=dev


# --------------------------------------------------
# Stage 3: Assemble the production image
# --------------------------------------------------
FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy the compiled backend and its production dependencies.
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Copy the compiled React frontend.
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create the directory used for Multer product uploads.
RUN mkdir -p /app/backend/uploads/products

EXPOSE 8000

CMD ["node", "backend/dist/server.js"]