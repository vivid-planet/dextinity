import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [
        // The SWC plugin is required to emit decorator metadata.
        // See https://github.com/vitest-dev/vitest/discussions/3320.
        swc.vite(),
    ],
    test: {
        environment: "node",
        setupFiles: ["./vitest.setup.ts"],
        reporters: ["default", "junit"],
        outputFile: {
            junit: "./junit-unit.xml",
        },
        testTimeout: 20000,
        hookTimeout: 20000,
    },
});
