import { resolve } from "node:path";

import { persistedQueriesPlugin } from "@dextinity/site-react-router/vite";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        reactRouterRSC(),
        rsc(),
        persistedQueriesPlugin({ persistedQueriesPath: "build/persisted-queries.json", include: resolve(import.meta.dirname, "src") }),
    ],
    resolve: {
        alias: { "@src": resolve(import.meta.dirname, "src") },
    },
    // The environment variables are read by the server at runtime, not at build time
    envDir: false,
    environments: {
        ssr: {
            resolve: {
                // CommonJS dependencies whose exports Node.js doesn't detect when they are imported from an ES module
                noExternal: ["prop-types"],
            },
            optimizeDeps: { include: ["react-focus-lock > prop-types"] },
            build: {
                rolldownOptions: {
                    // Loaded by the mail routes with loadMailsEntry()
                    input: { mails: "./src/routes/mails/mailsEntry.ts" },
                },
            },
        },
    },
    build: {
        // public/assets keeps the names of its files, so the hashed build assets get a folder of their own that can be cached forever
        assetsDir: "_assets",
    },
});
