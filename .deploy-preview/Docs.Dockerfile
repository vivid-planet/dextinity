# syntax=docker/dockerfile:1

FROM mirror.gcr.io/library/node:24-bookworm AS build

ENV CI=true HUSKY=0 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# corepack enable needs root, everything after it runs as the node user.
# WORKDIR would create /app as root.
RUN corepack enable && mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

COPY --chown=node:node --parents package.json pnpm-lock.yaml pnpm-workspace.yaml packages/**/package.json demo/**/package.json docs/package.json storybook/package.json ./
# Cache mounts belong to root unless uid/gid say otherwise.
RUN --mount=type=cache,id=dextinity-demo-deploy-preview-pnpm-store,target=/pnpm-store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --store-dir /pnpm-store --filter=dextinity-docs

COPY --chown=node:node docs docs/
RUN NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter=dextinity-docs run build

FROM mirror.gcr.io/library/caddy:2-alpine

COPY --from=build /app/docs/build /srv
COPY <<CADDYFILE /etc/caddy/Caddyfile
{
	admin off
	auto_https off
	persist_config off
}

:8080 {
	root * /srv
	file_server
	handle_errors 404 {
		rewrite * /404.html
		file_server
	}
}
CADDYFILE

USER 1000:1000
EXPOSE 8080
