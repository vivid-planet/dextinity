import { join } from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        projects: [
            {
                resolve: { tsconfigPaths: true },
                test: {
                    name: "unit",
                    environment: "jsdom",
                    exclude: ["dist/**", "node_modules/**", "storybook-static/**"],
                },
            },
            {
                // storybookTest doesn't load the builder's viteConfigPath from .storybook/main.ts
                extends: "./.storybook/vite.config.ts",
                plugins: [storybookTest({ configDir: join(import.meta.dirname, ".storybook") })],
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
