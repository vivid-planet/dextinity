# syntax=docker/dockerfile:1

FROM mirror.gcr.io/library/node:24-bookworm
WORKDIR /app

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# The manifests are copied on their own, so that a source change does not invalidate the install.
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
RUN --mount=type=cache,id=dextinity-demo-preview-pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter='dextinity-demo-api...'

COPY . .
# CI=true makes copy-project-files.js copy instead of symlink, and skip the .env files: the
# configuration is injected by docker-compose.yml.
RUN node copy-project-files.js && sh demo/api/intl-update.sh
RUN pnpm --recursive --filter='dextinity-demo-api^...' run build

WORKDIR /app/demo/api
RUN pnpm run build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["/app/.deploy-preview/api-start.sh"]
