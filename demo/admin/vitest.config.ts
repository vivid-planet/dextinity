import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        projects: [
            {
                // Like in vite.config.mts: Draft.js reads the Node.js `global`, which the browser doesn't have.
                define: { global: "globalThis" },
                plugins: [storybookTest({ configDir: join(currentDirectory, ".storybook") })],
                optimizeDeps: {
                    rolldownOptions: {
                        // Without it, the pre-bundled emotion JSX runtime resolves React's `jsxDEV` from the production build, where it is undefined.
                        transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
                    },
                },
                test: {
                    name: "storybook",
                    browser: {
                        enabled: true,
                        headless: true,
                        // Chromium's sandbox can't run as root, which is how the CI container executes jobs.
                        provider: playwright({ launchOptions: { args: ["--no-sandbox"] } }),
                        instances: [{ browser: "chromium" }],
                    },
                },
            },
        ],
    },
});
