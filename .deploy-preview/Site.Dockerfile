# syntax=docker/dockerfile:1

FROM mirror.gcr.io/library/node:24-bookworm
WORKDIR /app

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# The manifests are copied on their own, so that a source change does not invalidate the install.
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
RUN --mount=type=cache,id=dextinity-demo-preview-pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter='dextinity-demo-site...'

COPY . .
# CI=true makes copy-project-files.js copy instead of symlink, and skip the .env files: the
# configuration is injected by docker-compose.yml.
RUN node copy-project-files.js && sh demo/site/intl-update.sh
RUN pnpm --recursive --filter='dextinity-demo-site^...' run build

WORKDIR /app/demo/site
# Next.js evaluates the route modules while building, which read their configuration from the
# environment. The build therefore gets the development defaults from the checked-in .env, which is
# deleted again right after, so that at runtime only what docker-compose.yml injects is in effect.
# The contact form and the reCAPTCHA client fail without values that .env leaves empty, so the build
# gets placeholders; at runtime they are only used when a form is submitted. The cache handler is
# disabled, because Valkey is not reachable while building.
RUN --mount=type=cache,id=dextinity-demo-preview-next-cache,target=/app/demo/site/.next/cache \
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
