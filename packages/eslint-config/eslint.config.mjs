import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { configs as eslintPluginJsonc } from "eslint-plugin-jsonc";
import packageJson from "eslint-plugin-package-json";

export default defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    prettierPlugin,
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            "unused-imports/no-unused-imports": "error",
        },
    },
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        // Rules
        rules: {
            "prefer-template": "error",
            "no-console": ["error", { allow: ["warn", "error", "info", "debug"] }],
            "no-return-await": "error",
        },
    },
    /* order matters -> json rules must be after typescript rules*/
    ...eslintPluginJsonc["flat/recommended-with-json"],
    {
        ignores: ["package.json"],
        rules: {
            "jsonc/sort-keys": "error",
        },
    },
    {
        ...packageJson.configs.recommended,
        rules: {
            "package-json/require-attribution": "off",
        },
    },
]);
