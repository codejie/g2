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

RUN apk add --no-cache git

ARG NPM_REGISTRY=https://registry.npmjs.org/

WORKDIR /app

RUN git clone https://github.com/codejie/g2.git . && \
    npm config set registry "${NPM_REGISTRY}" && \
    npm ci --ignore-scripts

RUN npm run build

# ---- Stage 2: Runtime ----
FROM docker.io/library/node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN curl -fsSL https://opencode.ai/install | bash && \
    OPENCODE_BIN=$(find /root -name opencode -type f 2>/dev/null | head -1) && \
    cp "$OPENCODE_BIN" /usr/local/bin/opencode && \
    chmod +x /usr/local/bin/opencode

RUN npm install -g vite

ENV OPENCODE_CONFIG=/config/opencode.json

RUN mkdir -p /config

ARG OPENCODE_CONFIG_PATH=./docker/opencode.json
COPY ${OPENCODE_CONFIG_PATH} /config/opencode.json

COPY --from=builder /app/dist /app

VOLUME /workspace

EXPOSE 3000 4000

WORKDIR /app

CMD bash -c 'opencode serve --port 4000 --hostname 0.0.0.0 & \
    vite --port 3000 --host 0.0.0.0 & \
    wait'
