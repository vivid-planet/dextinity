import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type ViteUserConfig } from "vitest/config";

const contractClassNames: NonNullable<ViteUserConfig["test"]>["css"] = {
    include: [/\.module\.scss$/],
    modules: {
        // "stable" (the default) would override the generateScopedName from `vite.config.mts`.
        classNameStrategy: "scoped",
    },
};

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        projects: [
            {
                extends: "./vite.config.mts",
                test: {
                    name: "unit",
                    environment: "jsdom",
                    setupFiles: "./vitest.setup.ts",
                    exclude: ["lib/**", "node_modules/**"],
                    css: contractClassNames,
                },
            },
            {
                extends: "./vite.config.mts",
                plugins: [storybookTest({ configDir: ".storybook" })],
                optimizeDeps: {
                    include: ["storybook/internal/csf", "@storybook/react-vite"],
                },
                test: {
                    name: "storybook",
                    setupFiles: ["./vitest.storybook.setup.ts"],
                    css: contractClassNames,
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium", launch: { channel: "chromium-headless-shell" } }],
                    },
                },
            },
            {
                extends: "./vite.config.mts",
                // Runs the stories shown on docs pages again in a frame like the one of a docs page, and checks that the frame
                // doesn't cut off or shrink the popups they open
                plugins: [storybookTest({ configDir: ".storybook", tags: { include: ["autodocs"] } })],
                optimizeDeps: {
                    include: ["storybook/internal/csf", "@storybook/react-vite"],
                },
                test: {
                    name: "storybook-docs-popups",
                    setupFiles: ["./vitest.storybook.setup.ts", "./vitest.storybook-docs-popups.setup.ts"],
                    css: contractClassNames,
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium", launch: { channel: "chromium-headless-shell" } }],
                        viewport: { width: 1280, height: 1000 },
                    },
                },
            },
            {
                extends: "./vite.config.mts",
                // Runs the stories tagged `forced-colors` again with forced colors emulated, e.g. a Windows contrast theme
                plugins: [storybookTest({ configDir: ".storybook", tags: { include: ["forced-colors"] } })],
                optimizeDeps: {
                    include: ["storybook/internal/csf", "@storybook/react-vite"],
                },
                test: {
                    name: "storybook-forced-colors",
                    setupFiles: ["./vitest.storybook.setup.ts"],
                    css: contractClassNames,
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({ contextOptions: { forcedColors: "active" } }),
                        instances: [{ browser: "chromium", launch: { channel: "chromium-headless-shell" } }],
                    },
                },
            },
        ],
    },
});
