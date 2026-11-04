import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { configs as eslintPluginJsonc } from "eslint-plugin-jsonc";
import importPlugin from "eslint-plugin-import";
import packageJson from "eslint-plugin-package-json";

export default defineConfig([
    globalIgnores(["lib/**/*", "bin/**/*"]),
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
        ...importPlugin.flatConfigs.recommended,
        rules: {
            "import/no-duplicates": "error",
            "import/newline-after-import": "error",
            "import/no-extraneous-dependencies": "error",
        },
    },
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
    {
        ignores: ["*.json"],
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
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    disallowTypeAnnotations: false,
                    fixStyle: "inline-type-imports",
                },
            ],
        },
    },
]);
