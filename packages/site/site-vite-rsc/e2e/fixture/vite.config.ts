import { resolve } from "node:path";

import { dextinitySite } from "@dextinity/site-vite-rsc/vite";
import { defineConfig } from "vite";

// Runs the package's entries with the routes in handler.tsx
export default defineConfig({
    root: import.meta.dirname,
    cacheDir: resolve(import.meta.dirname, "../../node_modules/.vite-e2e"),
    plugins: [dextinitySite({ app: "./handler.tsx" })],
});
