import { resolve } from "node:path";

import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

// Runs the package's entries with the routes in handler.tsx
export default defineConfig({
    root: import.meta.dirname,
    cacheDir: resolve(import.meta.dirname, "../../node_modules/.vite-e2e"),
    plugins: [dextinitySite({ app: "./handler.tsx" })],
    environments: {
        client: {
            // Client components are only loaded at runtime, so Vite would discover their dependencies late and reload the page
            optimizeDeps: { include: ["@dextinity/site-vite-rsc > @dextinity/site-react"] },
        },
    },
});
