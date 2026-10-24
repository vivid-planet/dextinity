import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

const siteDir = resolve(import.meta.dirname, "../..");

// Runs the framework of the site with the routes in handler.tsx instead of the site's routes
export default defineConfig({
    root: import.meta.dirname,
    envDir: false,
    cacheDir: resolve(siteDir, "node_modules/.vite-e2e"),
    plugins: [
        rsc({
            entries: {
                rsc: resolve(siteDir, "src/framework/entry.rsc.tsx"),
                ssr: resolve(siteDir, "src/framework/entry.ssr.tsx"),
                client: resolve(siteDir, "src/framework/entry.browser.tsx"),
            },
        }),
        react(),
    ],
    resolve: {
        alias: [
            { find: "@src/handler", replacement: resolve(import.meta.dirname, "handler.tsx") },
            { find: "@src", replacement: resolve(siteDir, "src") },
        ],
    },
});
