import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        reporters: ["default", "junit"],
        outputFile: {
            junit: "./junit-unit.xml",
        },
    },
});
