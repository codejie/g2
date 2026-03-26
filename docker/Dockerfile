# ============================================
# OpenCode + G2 Application
# ============================================
# Multi-stage build for minimal image size
#
# Build commands:
#   docker build -f docker/Dockerfile -t g2-app:latest .
#
#   # With custom config:
#   docker build -f docker/Dockerfile --build-arg OPENCODE_CONFIG_PATH=/path/to/config.json -t g2-app:latest .

# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS builder

ARG NPM_REGISTRY=https://registry.npmjs.org/

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set registry "${NPM_REGISTRY}" && \
    npm ci --ignore-scripts

COPY . .
RUN npm run build

# ---- Stage 2: Runtime ----
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://opencode.ai/install | bash && \
    OPENCODE_BIN=$(find /root -name opencode -type f 2>/dev/null | head -1) && \
    cp "$OPENCODE_BIN" /usr/local/bin/opencode && \
    chmod +x /usr/local/bin/opencode

ENV OPENCODE_CONFIG=/config/opencode.json

RUN mkdir -p /config

ARG OPENCODE_CONFIG_PATH=./docker/opencode.json
COPY ${OPENCODE_CONFIG_PATH} /config/opencode.json

COPY --from=builder /app/dist /srv/g2

VOLUME /workspace

EXPOSE 3000 4096

WORKDIR /workspace

CMD sh -c 'opencode serve --port 4096 --hostname 0.0.0.0 & \
    cd /srv/g2 && npx vite preview --port 3000 --host 0.0.0.0 & \
    wait'
