import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit.xml" },
        projects: [
            {
                plugins: [storybookTest({ configDir: ".storybook" })],
                define: {
                    global: "globalThis",
                },
                optimizeDeps: {
                    include: ["storybook/internal/csf", "@storybook/react-vite"],
                    rolldownOptions: {
                        transform: {
                            define: {
                                global: "globalThis",
                            },
                        },
                    },
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
