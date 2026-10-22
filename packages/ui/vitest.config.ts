import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { generateScopedName } from "./src/cssModules/generateScopedName";

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        projects: [
            {
                css: {
                    modules: {
                        generateScopedName,
                    },
                },
                test: {
                    name: "unit",
                    environment: "jsdom",
                    setupFiles: "./vitest.setup.ts",
                    exclude: ["lib/**", "node_modules/**"],
                    css: {
                        include: [/\.module\.scss$/],
                        modules: {
                            // "stable" (the default) would override the vite-level generateScopedName above.
                            classNameStrategy: "scoped",
                        },
                    },
                },
            },
            {
                plugins: [storybookTest({ configDir: ".storybook" })],
                optimizeDeps: {
                    include: ["storybook/internal/csf", "@storybook/react-vite"],
                },
                test: {
                    name: "storybook",
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium", launch: { channel: "chromium-headless-shell" } }],
                    },
                },
            },
        ],
    },
});
