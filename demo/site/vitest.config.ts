import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        projects: [
            {
                plugins: [tsconfigPaths()],
                test: {
                    name: "unit",
                    environment: "jsdom",
                    exclude: [".next/**", "dist/**", "node_modules/**", "storybook-static/**"],
                },
            },
            {
                // `@src` comes from the alias in .storybook/main.ts, which storybookTest applies.
                plugins: [storybookTest({ configDir: join(currentDirectory, ".storybook") })],
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
