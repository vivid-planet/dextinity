import { resolve } from "node:path";

import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

import { persistedQueriesPlugin } from "../../lib/vite.js";

const library = resolve(import.meta.dirname, "../../lib");

// The test app uses the build of the library, like a site does
export default defineConfig({
    plugins: [
        reactRouterRSC(),
        rsc(),
        persistedQueriesPlugin({ persistedQueriesPath: "build/persisted-queries.json", include: resolve(import.meta.dirname, "app") }),
    ],
    resolve: {
        alias: [
            { find: /^@dextinity\/site-react-router$/, replacement: `${library}/index.js` },
            { find: /^@dextinity\/site-react-router\/(server|node)$/, replacement: `${library}/$1.js` },
            { find: /^@dextinity\/site-react-router\/css$/, replacement: `${library}/style.css` },
        ],
    },
    envDir: false,
    // The production build of the tests runs next to the development server
    server: { watch: { ignored: ["**/build/**"] } },
    build: { assetsDir: "_assets" },
});
