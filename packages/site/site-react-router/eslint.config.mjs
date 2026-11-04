import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores(["lib/**", "**/*.generated.ts", "block-meta.json", "test-results/**", "playwright-report/**", "e2e/fixture/build/**", "e2e/fixture/.react-router/**"]),
    ...eslintConfigReact,
    {
        files: ["e2e/**"],
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "react/jsx-no-literals": "off",
        },
    },
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        ignores: ["**/*.json"],
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
