import { defineConfig } from "vitest/config";

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
                },
            },
        ],
    },
});
