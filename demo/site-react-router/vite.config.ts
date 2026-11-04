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
        client: {
            // The client components are only found when a page requests them, so Vite would optimize their dependencies late and reload the page.
            // Scanning all source files finds the dependencies when the development server starts.
            optimizeDeps: { entries: ["src/**/*.tsx"] },
        },
        ssr: {
            resolve: {
                // CommonJS dependencies whose exports Node.js doesn't detect when they are imported from an ES module
                noExternal: ["prop-types"],
                // Used by the mails of @dextinity/mail-react, its dependency css-tree reads its package.json at runtime, which fails when it's bundled.
                // The site depends on it directly, so that Node.js can resolve it.
                external: ["csso"],
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
