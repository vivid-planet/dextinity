import { resolve } from "node:path";

import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

// The test app runs the package's server code with the routes in app/routes.ts
export default defineConfig({
    root: import.meta.dirname,
    cacheDir: resolve(import.meta.dirname, "../../node_modules/.vite-e2e"),
    plugins: [reactRouterRSC(), rsc()],
    build: { assetsDir: "_assets" },
    environments: {
        client: {
            // Client components are only loaded at runtime, so Vite would discover their dependencies late and reload the page
            optimizeDeps: { include: ["@dextinity/site-react-router > @dextinity/site-react"] },
        },
    },
});
