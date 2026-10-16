#!/usr/bin/env bash
set -e

# Starts the demo as a deploy preview environment: renders the site configs for the deploy preview
# host, builds the images and brings the compose project up, blocking until it is healthy. Everything
# project specific happens here, so that a deploy preview controller only has to run this script and
# gets a running compose project.
#
# Configured through the environment, all optional:
#
#   COMPOSE_PROJECT_NAME      compose project to create (default dextinity-demo-deploy-preview)
#   DEPLOY_PREVIEW_PORT       host port the environment is published on (default 8080)
#   DEPLOY_PREVIEW_HOST       public host incl. port (default demo.preview.localhost:<DEPLOY_PREVIEW_PORT>)
#   DEPLOY_PREVIEW_SCHEME     http or https (default http)
#   DEPLOY_PREVIEW_URLS_FILE  file to report the urls of this deploy preview to, one "<name>=<url>" per line
#
# Without any of them it starts the deploy preview environment on http://demo.preview.localhost:8080.
#
# Everything besides the site lives one label next to the base domain and not below it -
# admin--<host> and not admin.<host> - so that one wildcard certificate covers it.
#
# See .deploy-preview/README.md for details.

cd "$(dirname "$0")"

export DEPLOY_PREVIEW_PORT="${DEPLOY_PREVIEW_PORT:-8080}"
export DEPLOY_PREVIEW_SCHEME="${DEPLOY_PREVIEW_SCHEME:-http}"
export DEPLOY_PREVIEW_HOST="${DEPLOY_PREVIEW_HOST:-demo.preview.localhost:$DEPLOY_PREVIEW_PORT}"
if [[ "$DEPLOY_PREVIEW_SCHEME" == "https" ]]
then
    export DEPLOY_PREVIEW_COOKIE_SECURE=true
else
    export DEPLOY_PREVIEW_COOKIE_SECURE=false
fi

if [[ -s "$HOME/.nvm/nvm.sh" ]]
then
    . "$HOME/.nvm/nvm.sh"
    nvm install
fi

# The images do not know the deploy preview host: the site configs are rendered for it here and
# injected into api, admin and site by the compose file. Rendering needs the dextinity cli, which is
# installed and built on its own when the repository has not been set up with ./install.sh.
if [[ ! -x ./node_modules/.bin/dextinity || ! -f ./packages/cli/lib/dextinity.js ]]
then
    command -v pnpm > /dev/null || corepack enable
    pnpm install --frozen-lockfile --filter=. --filter=@dextinity/cli
    pnpm --filter @dextinity/cli run build
fi
SITE_DOMAIN="$DEPLOY_PREVIEW_HOST" ./node_modules/.bin/dextinity inject-site-configs \
    -f demo/site-configs/site-configs.ts \
    -i demo/.env.site-configs.tpl \
    -o demo/.env.site-configs.deploy-preview \
    --base64

docker compose -p "${COMPOSE_PROJECT_NAME:-dextinity-demo-deploy-preview}" \
    -f .deploy-preview/docker-compose.yml --project-directory . up --build -d --wait

# Tell the caller which domains this project serves, so it can link to them.
if [[ -n "${DEPLOY_PREVIEW_URLS_FILE:-}" ]]
then
    cat > "$DEPLOY_PREVIEW_URLS_FILE" <<URLS
Site=$DEPLOY_PREVIEW_SCHEME://$DEPLOY_PREVIEW_HOST
Admin=$DEPLOY_PREVIEW_SCHEME://admin--$DEPLOY_PREVIEW_HOST
Mails=$DEPLOY_PREVIEW_SCHEME://mail--$DEPLOY_PREVIEW_HOST
URLS
fi
