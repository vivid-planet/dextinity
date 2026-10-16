# syntax=docker/dockerfile:1

FROM mirror.gcr.io/library/node:24-bookworm
WORKDIR /app

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# The manifests are copied on their own, so that a source change does not invalidate the install.
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
RUN --mount=type=cache,id=dextinity-demo-preview-pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter='dextinity-demo-admin...' --filter=dextinity-demo-admin-server

COPY . .
# CI=true makes copy-project-files.js copy instead of symlink, and skip the .env files: the
# configuration is injected by docker-compose.yml.
RUN node copy-project-files.js && sh demo/admin/intl-update.sh
RUN pnpm --recursive --filter='dextinity-demo-admin^...' run build

WORKDIR /app/demo/admin
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm run build

# The build is static. demo/admin/server injects the environment variables into index.html when it
# starts, and serves ./build relative to its working directory.
ENV NODE_ENV=production
EXPOSE 8001
CMD ["node", "server"]
