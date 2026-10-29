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
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter='dextinity-demo-admin...' --filter=dextinity-demo-admin-server

COPY --chown=node:node . .
# CI=true makes copy-project-files.js copy instead of symlink.
RUN node copy-project-files.js && sh demo/admin/intl-update.sh
RUN pnpm --recursive --filter='dextinity-demo-admin^...' run build

WORKDIR /app/demo/admin
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build

ENV NODE_ENV=production
EXPOSE 8001
CMD ["node", "server/index.ts"]
