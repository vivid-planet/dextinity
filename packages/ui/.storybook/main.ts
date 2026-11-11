import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import { storyCodePlugin } from "./storyCodePlugin";
import { addStyleSourcesToManifests } from "./addStyleSourcesToManifests";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/__stories__/*.stories.tsx"],
    addons: ["@storybook/addon-docs", "@storybook/addon-mcp", "@storybook/addon-vitest", "storybook-addon-tag-badges", "storybook-addon-pseudo-states"],
    framework: "@storybook/react-vite",
    staticDirs: [{ from: "../src/docs/theme/__stories__/customization", to: "/customization" }],
    tags: {
        development: { defaultFilterSelection: "exclude" },
    },
    features: { componentsManifest: true },
    experimental_manifests: addStyleSourcesToManifests,
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, {
            plugins: [storyCodePlugin()],
            build: {
                // Base UI marks its modules with "use client", which has no meaning in the client-only Storybook bundle
                rolldownOptions: { checks: { moduleLevelDirective: false } },
            },
        }),
};

export default config;
