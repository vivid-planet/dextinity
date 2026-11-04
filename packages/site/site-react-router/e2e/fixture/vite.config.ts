import { resolve } from "node:path";

import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

// The test app runs the package's server code with the routes in app/routes.ts
export default defineConfig({
    root: import.meta.dirname,
    cacheDir: resolve(import.meta.dirname, "../../node_modules/.vite-e2e"),
    plugins: [reactRouter()],
    build: { assetsDir: "_assets" },
    environments: {
        ssr: { build: { rollupOptions: { input: "./app/app.ts" } } },
    },
});
