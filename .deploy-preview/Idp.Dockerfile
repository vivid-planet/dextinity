# syntax=docker/dockerfile:1

FROM mirror.gcr.io/library/node:24-bookworm

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# corepack enable needs root, everything after it runs as the node user.
# WORKDIR would create /app as root.
RUN corepack enable && mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

COPY --chown=node:node --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
# Cache mounts belong to root unless uid/gid say otherwise.
RUN --mount=type=cache,id=dextinity-demo-deploy-preview-pnpm-store,target=/pnpm-store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter=.

COPY --chown=node:node --parents dev-oidc-provider.config.mts demo/api/src/auth/static-users.ts ./

EXPOSE 8080
CMD ["node_modules/.bin/dev-oidc-provider"]
