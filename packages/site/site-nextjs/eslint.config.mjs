import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigNextJs from "@dextinity/eslint-config/future/nextjs.js";

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**", "**/*.generated.ts", "block-meta.json"]),
    ...eslintConfigNextJs,
    {
        rules: {
            "@next/next/no-html-link-for-pages": "off", // disabled because lib has no pages dir
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        ignores: ["*.json"],
        rules: {
            "@typescript-eslint/consistent-type-exports": [
                "error",
                {
                    fixMixedExportsWithInlineTypeSpecifier: true,
                },
            ],
        },
    },
]);
