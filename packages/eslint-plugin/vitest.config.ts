import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
        setupFiles: "./vitest.setup.ts",
    },
});
