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
                rolldownOptions: {
                    // Loaded by the mail routes, see routes/mails/loadMailsEntry.ts
                    input: { mails: "./src/routes/mails/mailsEntry.ts" },
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
