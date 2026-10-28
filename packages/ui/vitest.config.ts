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
                    css: contractClassNames,
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
