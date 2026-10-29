#!/bin/sh
set -e

# The fixtures command drops all tables, so it runs only once. The marker lives in the uploads
# volume, which has the same lifetime as the database volume.
fixtures_marker="$FILE_STORAGE_PATH/.fixtures-loaded"

if [ ! -f "$fixtures_marker" ]; then
    node dist/console.js fixtures
    touch "$fixtures_marker"
else
    node dist/console.js migrate
fi

node dist/console.js createBlockIndexViews

exec node dist/main
