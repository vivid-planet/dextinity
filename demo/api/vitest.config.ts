import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        exclude: ["dist/**", "node_modules/**"],
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit-unit.xml" },
    },
});
