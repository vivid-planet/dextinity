import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        // Mirrors the alias from .storybook/main.ts.
        alias: {
            "@src": resolve(currentDirectory, "src"),
        },
    },
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-storybook.xml" },
        projects: [
            {
                extends: true,
                plugins: [storybookTest({ configDir: ".storybook" })],
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
