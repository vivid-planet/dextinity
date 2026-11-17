import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        exclude: ["lib/**", "node_modules/**", "e2e/**"],
        reporters: ["default", "junit"],
        outputFile: {
            junit: "./junit-unit.xml",
        },
    },
});
