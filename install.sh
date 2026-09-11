#!/usr/bin/env bash
. ~/.nvm/nvm.sh

# jump into project dir
cd $(dirname $0)

# create .env.local
if [[ ! -f .env.local ]]; then
    echo "# override for local env" >.env.local
fi

# use correct node version and install dependencies
nvm install
nvm use
corepack enable

pnpm install

pnpm run copy-project-files

# Lang install
sh ./demo/admin/intl-update.sh
sh ./demo/api/intl-update.sh
sh ./demo/site/intl-update.sh

# Build the packages CLI and eslint-plugin to be used for dev startup
pnpm --filter '@dextinity/cli' --filter '@dextinity/eslint-plugin' run build

# Install agent features
pnpm run install-agent-features

# create site-config-envs
pnpm run create-site-configs-env

pnpm run setup:download-oauth2-proxy
