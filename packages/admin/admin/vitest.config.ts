import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import { generateScopedName } from "./src/future-ui/cssModules/generateScopedName";

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: {
            junit: "./junit-unit.xml",
        },
        projects: [
            {
                plugins: [tsconfigPaths()],
                css: {
                    modules: {
                        generateScopedName,
                    },
                },
                test: {
                    name: "unit",
                    environment: "jsdom",
                    setupFiles: "./vitest.setup.ts",
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
                plugins: [tsconfigPaths(), storybookTest({ configDir: ".storybook" })],
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
