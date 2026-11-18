# syntax=docker/dockerfile:1.7
# Job de migration (prisma migrate deploy). Roda uma vez antes de cada deploy.
ARG NODE_VERSION=22.23.5
FROM node:${NODE_VERSION}-bookworm-slim
ARG VERSION=dev
LABEL org.opencontainers.image.source="https://github.com/kleidimilson/zenbit-sandbox" \
      org.opencontainers.image.version="${VERSION}"
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/ packages/db/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter db...
USER 1000:1000
CMD ["pnpm", "--filter", "db", "exec", "prisma", "migrate", "deploy"]
