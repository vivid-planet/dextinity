import { resolve } from "node:path";

import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

const siteDir = resolve(import.meta.dirname, "../..");

// Runs the framework of the site with the routes in handler.tsx instead of the site's routes
export default defineConfig({
    root: import.meta.dirname,
    cacheDir: resolve(siteDir, "node_modules/.vite-e2e"),
    plugins: [
        dextinitySite({
            entries: {
                rsc: resolve(siteDir, "src/framework/entry.rsc.tsx"),
                ssr: resolve(siteDir, "src/framework/entry.ssr.tsx"),
                client: resolve(siteDir, "src/framework/entry.browser.tsx"),
            },
        }),
    ],
    resolve: {
        alias: [
            { find: "@src/handler", replacement: resolve(import.meta.dirname, "handler.tsx") },
            { find: "@src", replacement: resolve(siteDir, "src") },
        ],
    },
});
