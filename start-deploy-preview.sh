#!/usr/bin/env bash
set -e

# Starts the demo as a deploy preview environment, see .deploy-preview/README.md for the configuration.

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

# The images do not know the deploy preview host, so the site configs are rendered for it here.
if [[ ! -x ./node_modules/.bin/dextinity || ! -f ./packages/cli/lib/dextinity.js ]]
then
    if ! command -v pnpm > /dev/null
    then
        # A plain corepack enable writes next to the node binary, which needs root for a system wide
        # installation.
        pnpm_directory="$(mktemp -d)"
        corepack enable --install-directory "$pnpm_directory" pnpm
        export PATH="$pnpm_directory:$PATH"
    fi
    export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
    pnpm install --frozen-lockfile --filter=. --filter=@dextinity/cli
    pnpm --filter @dextinity/cli run build
fi
./node_modules/.bin/dextinity inject-site-configs \
    -f demo/site-configs/site-configs.ts \
    -i demo/.env.site-configs.tpl \
    -o demo/.env.site-configs.deploy-preview \
    --base64

docker compose -p "${COMPOSE_PROJECT_NAME:-dextinity-demo-deploy-preview}" \
    -f .deploy-preview/docker-compose.yml --project-directory . up --build -d --wait

if [[ -n "${DEPLOY_PREVIEW_URLS_FILE:-}" ]]
then
    cat > "$DEPLOY_PREVIEW_URLS_FILE" <<URLS
Site=$DEPLOY_PREVIEW_SCHEME://$DEPLOY_PREVIEW_HOST
Admin=$DEPLOY_PREVIEW_SCHEME://admin--$DEPLOY_PREVIEW_HOST
Mailpit=$DEPLOY_PREVIEW_SCHEME://mail--$DEPLOY_PREVIEW_HOST
URLS
fi
