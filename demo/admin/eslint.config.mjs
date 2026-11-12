import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";
import storybook from "eslint-plugin-storybook";

export default defineConfig([
    globalIgnores([
        "schema.json",
        "src/fragmentTypes.json",
        "dist/**",
        "storybook-static/**",
        "src/**/*.generated.ts",
        "src/**/generated/**",
        "block-meta.json",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
    ]),
    ...eslintConfigReact,
    ...storybook.configs["flat/recommended"],
    {
        // The storybook config files live outside tsconfig.json's `include`, in their own project.
        files: [".storybook/**/*.{ts,tsx}", "vitest.config.ts"],
        languageOptions: {
            parserOptions: {
                projectService: false,
                project: ["./tsconfig.storybook.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
]);
