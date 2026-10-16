# syntax=docker/dockerfile:1

# The dev OpenID Connect provider of local development (see dev-oidc-provider.config.mts), which
# offers the users of demo/api/src/auth/static-users.ts on its login page.
FROM mirror.gcr.io/library/node:24-bookworm
WORKDIR /app

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
RUN --mount=type=cache,id=dextinity-demo-preview-pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter=.

COPY --parents dev-oidc-provider.config.mts demo/api/src/auth/static-users.ts ./

EXPOSE 8080
CMD ["node_modules/.bin/dev-oidc-provider"]
