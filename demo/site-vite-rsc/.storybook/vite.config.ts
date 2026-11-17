import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Storybook and the story tests can't use the site's vite.config.ts: @vitejs/plugin-rsc builds server, SSR and
// browser environments around the site's entries, while Storybook renders the components in the browser only.
export default defineConfig({
    plugins: [react()],
    // The site configs, loaded by the SiteConfigProvider decorator, read process.env, which doesn't exist in the browser.
    // They fall back to their local defaults.
    define: { "process.env": {} },
    resolve: {
        alias: {
            "@src": resolve(import.meta.dirname, "../src"),
        },
    },
});
