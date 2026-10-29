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
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter='dextinity-demo-site...'

COPY --chown=node:node . .
# CI=true makes copy-project-files.js copy instead of symlink.
RUN node copy-project-files.js && sh demo/site/intl-update.sh
RUN pnpm --recursive --filter='dextinity-demo-site^...' run build

WORKDIR /app/demo/site
# BuildKit creates the parent of a cache mount as root, but next writes .next/trace next to it.
RUN mkdir -p .next
# next build evaluates the route modules, which fail without the defaults of .env and placeholders for
# what .env leaves empty. Valkey is not reachable while building.
RUN --mount=type=cache,id=dextinity-demo-deploy-preview-next-cache,target=/app/demo/site/.next/cache,uid=1000,gid=1000 \
    cp ../../.env .env \
    && NODE_OPTIONS=--max-old-space-size=4096 \
    CONTACT_FORM_FROM_EMAIL=placeholder@example.com \
    CONTACT_FORM_TO_EMAIL=placeholder@example.com \
    RECAPTCHA_SERVICE_ACCOUNT="$(echo '{"project_id":"placeholder"}' | base64)" \
    VALKEY_ENABLED=false \
    pnpm run build \
    && rm .env

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
