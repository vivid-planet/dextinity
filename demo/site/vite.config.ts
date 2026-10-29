import { resolve } from "node:path";

import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

import { persistedQueriesPlugin } from "./vitePersistedQueriesPlugin.ts";

export default defineConfig({
    plugins: [
        dextinitySite({
            entries: {
                rsc: "./src/framework/entry.rsc.tsx",
                ssr: "./src/framework/entry.ssr.tsx",
                client: "./src/framework/entry.browser.tsx",
            },
        }),
        persistedQueriesPlugin({ persistedQueriesPath: "dist/persisted-queries.json", include: resolve(import.meta.dirname, "src") }),
    ],
    resolve: {
        alias: {
            "@src": resolve(import.meta.dirname, "src"),
        },
    },
    environments: {
        ssr: {
            build: {
                rolldownOptions: {
                    // Loaded by the mail routes in app/router.tsx
                    input: { mails: "./src/app/api/entry.mails.ts" },
                },
            },
            resolve: {
                noExternal: [
                    // CommonJS dependencies whose exports aren't detected by Node.js when imported from ESM
                    "prop-types",
                    // Imports React without declaring it as peer dependency, it would get a separate React instance when externalized
                    "swiper",
                ],
            },
            optimizeDeps: { include: ["react-focus-lock > prop-types"] },
        },
    },
});
