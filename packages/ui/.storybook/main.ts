import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import { addStyleSourcesToManifests } from "./addStyleSourcesToManifests";
import { storyCodePlugin } from "./storyCodePlugin";

const config: StorybookConfig = {
    stories: [
        "../src/**/*.mdx",
        "../src/**/__stories__/*.stories.tsx",
        "../../ui-react-final-form/src/**/__stories__/*.stories.tsx",
        "../../ui-react-hook-form/src/**/__stories__/*.stories.tsx",
    ],
    addons: ["@storybook/addon-docs", "@storybook/addon-mcp", "@storybook/addon-vitest", "storybook-addon-tag-badges"],
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
            resolve: {
                // The adapter packages' stories share this Storybook's copy of the components, styles included, instead of the build
                alias: [{ find: /^@dextinity\/ui$/, replacement: fileURLToPath(new URL("../src/index.ts", import.meta.url)) }],
            },
            build: {
                // Base UI marks its modules with "use client", which has no meaning in the client-only Storybook bundle
                rolldownOptions: { checks: { moduleLevelDirective: false } },
            },
        }),
};

export default config;
