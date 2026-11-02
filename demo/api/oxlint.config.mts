import nestjsConfig from "@dextinity/oxlint-config/nestjs.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [nestjsConfig],
    plugins: nestjsConfig.plugins,
    jsPlugins: [{ name: "storybook", specifier: "eslint-plugin-storybook" }],
    ignorePatterns: [
        "src/db/migrations/**",
        "dist/**",
        "src/**/*.generated.ts",
        "src/**/generated/**",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
    ],
    overrides: [
        {
            files: ["**/*.stories.ts", "**/*.stories.tsx"],
            rules: {
                "storybook/await-interactions": "error",
                "storybook/context-in-play-function": "error",
                "storybook/default-exports": "error",
                "storybook/hierarchy-separator": "warn",
                "storybook/no-redundant-story-name": "warn",
                "storybook/no-renderer-packages": "error",
                "storybook/prefer-pascal-case": "warn",
                "storybook/story-exports": "error",
                "storybook/use-storybook-expect": "error",
                "storybook/use-storybook-testing-library": "error",
            },
        },
    ],
});
