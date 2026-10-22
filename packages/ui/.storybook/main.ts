import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import { generateScopedName } from "../src/cssModules/generateScopedName.ts";

const config: StorybookConfig = {
    stories: ["../src/**/__stories__/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
    framework: "@storybook/react-vite",
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, {
            css: {
                modules: {
                    generateScopedName,
                },
            },
        }),
};

export default config;
