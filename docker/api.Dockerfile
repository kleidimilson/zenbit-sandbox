# syntax=docker/dockerfile:1.7
# API Node.js (apps/api). Build no GitHub Actions via docker-bake.hcl.
ARG NODE_VERSION=22.23.5

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile

FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline
RUN pnpm --filter api... build && pnpm --filter api deploy --prod /out

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ARG VERSION=dev
ARG REVISION=unknown
LABEL org.opencontainers.image.source="https://github.com/kleidimilson/zenbit-sandbox" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}"
ENV NODE_ENV=production APP_VERSION=${VERSION} PORT=8080
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends tini curl && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=1000:1000 /out ./
USER 1000:1000
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD ["curl", "-fsS", "http://localhost:8080/health"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/server.js"]
