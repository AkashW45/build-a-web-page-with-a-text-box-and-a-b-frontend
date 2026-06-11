# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Use `npm ci` only when a lockfile exists (it requires one); otherwise fall
# back to `npm install`. `--omit=dev` is the modern replacement for the removed
# `--only=production` flag (npm 9+ errors on the old flag, dumping help text).
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev; \
    else \
        npm install --omit=dev; \
    fi

COPY . .

# Build step if a build script exists; harmless otherwise
RUN if [ -f tsconfig.json ] || grep -q '"build"' package.json; then \
        npm run build || true; \
    fi

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app /app

EXPOSE 8000

CMD ["sh", "-c", "node server.js"]
