import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "jsdom",
        exclude: ["dist/**", "node_modules/**"],
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
    },
});
