import { resolve } from "node:path";

import { persistedQueriesPlugin } from "@dextinity/site-react-router/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        reactRouter(),
        persistedQueriesPlugin({ persistedQueriesPath: "build/persisted-queries.json", include: resolve(import.meta.dirname, "src") }),
    ],
    resolve: {
        alias: {
            "@src": resolve(import.meta.dirname, "src"),
        },
    },
    build: {
        // Files of public/assets keep their name, so the hashed build files get their own folder for long caching
        assetsDir: "_assets",
    },
    environments: {
        ssr: {
            build: {
                // The Hono app is the server entry, it passes the requests to React Router, see server.ts
                rollupOptions: { input: "./src/app.ts" },
            },
            resolve: {
                noExternal: [
                    // CommonJS dependencies whose exports aren't detected by Node.js when imported from ESM
                    "prop-types",
                    // Node.js would load its CommonJS build, whose default export is the module object
                    "react-focus-lock",
                    // Imports React without declaring it as peer dependency, it would get a separate React instance when externalized
                    "swiper",
                ],
            },
            optimizeDeps: { include: ["react-focus-lock > prop-types"] },
        },
    },
});
