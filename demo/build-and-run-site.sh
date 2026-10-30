# This script builds the site like in the CI and starts it.
#
# Reasons why you want to do this:
# - Check if it builds without warnings
# - Check if there are suggestions from next build
# - Check if it behaves in the same way like the dev-server
# - Check caching behaviour, e.g. Cache-Control header (which is always no-cache in dev-server)

#!/usr/bin/env bash

echo "[1/2] Build site..."
cd site
rm -f .env .env.local .env.site-configs
rm -rf .next
NODE_ENV=production pnpm run build
ln -sf ../../.env ./
ln -sf ../../.env.local ./
ln -sf ../.env.site-configs ./
echo ""

echo "[2/2] Start site..."
pnpm exec dotenv -e .env.secrets -e .env.site-configs -- pnpm run serve
