#!/bin/bash
set -e

LOG=/tmp/session-start.log
exec > >(tee -a "$LOG") 2>&1
trap 'echo "=== $(date +%Y-%m-%dT%H:%M:%S%z) session start exit=$? ==="' EXIT
echo "=== $(date +%Y-%m-%dT%H:%M:%S%z) session start ==="


# --- Cloud only ---
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
    # start dockerd
    if ! docker info >/dev/null 2>&1; then
        echo ">>> starting dockerd"
        sudo -n dockerd > /tmp/dockerd.log 2>&1 &
        for i in {1..15}; do
            docker info >/dev/null 2>&1 && break
            sleep 1
        done
        echo ">>> dockerd ready after ${i}s"
    fi

    # Activate the Node version from .nvmrc and expose it on PATH for every
    # subsequent shell by symlinking into $HOME/.local/bin (already first in PATH).
    export NVM_DIR="${NVM_DIR:-/opt/nvm}"
    echo ">>> NVM_DIR=$NVM_DIR"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        echo ">>> sourcing nvm.sh"
        set +e
        . "$NVM_DIR/nvm.sh"
        set -e
        echo ">>> nvm use || nvm install (.nvmrc: $(cat .nvmrc 2>/dev/null || echo 'not found'))"
        nvm use || nvm install
        node_bin=$(dirname "$(nvm which current)")
        echo ">>> node_bin=$node_bin"
        mkdir -p "$HOME/.local/bin"
        echo ">>> symlinking node binaries into $HOME/.local/bin"
        for b in "$node_bin"/*; do
            ln -sf "$b" "$HOME/.local/bin/$(basename "$b")"
        done
        echo ">>> node version: $(node --version), npm version: $(npm --version)"
    else
        echo ">>> nvm.sh not found at $NVM_DIR/nvm.sh, skipping node setup"
    fi

    if command -v playwright-cli >/dev/null 2>&1; then
        playwright-cli install --skills
    else
        echo "playwright-cli not found, skipping (install in environment setup script)"
    fi
fi


# --- pnpm install (only when lockfile changed) ---
cd "$CLAUDE_PROJECT_DIR"
stamp=node_modules/.install-stamp
hash=$(md5sum pnpm-lock.yaml | awk '{print $1}')
if [ ! -d node_modules ] || [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$hash" ]; then
    echo ">>> pnpm install"
    corepack enable
    pnpm install --frozen-lockfile
    echo "$hash" > "$stamp"
fi


# --- build cli + eslint-plugin (only when not built) ---
if [ ! -d packages/cli/lib ]; then
    echo ">>> building @dextinity/cli"
    pnpm --filter '@dextinity/cli' run build
fi
if [ ! -d packages/eslint-plugin/lib ]; then
    echo ">>> building @dextinity/eslint-plugin"
    pnpm --filter '@dextinity/eslint-plugin' run build
fi


# --- copy project files ---
CI=false pnpm run copy-project-files


# --- install agent skills ---
pnpm run install-agent-features


# --- lang clones (only when not existing) ---
[ -d ./demo/admin/lang ] || sh ./demo/admin/intl-update.sh
[ -d ./demo/api/lang ]   || sh ./demo/api/intl-update.sh
[ -d ./demo/site/lang ]  || sh ./demo/site/intl-update.sh


# --- create .env.site-configs ---
pnpm run create-site-configs-env


# --- download dev proxies ---
pnpm run setup:download-oauth2-proxy


exit 0
