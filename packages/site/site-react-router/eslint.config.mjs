import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**", "**/*.generated.ts", "block-meta.json", "e2e/fixture/build/**", "e2e/fixture/.react-router/**", "test-results/**"]),
    ...eslintConfigReact,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        files: ["e2e/**"],
        rules: {
            "react/jsx-no-literals": "off",
            "@calm/react-intl/missing-formatted-message": "off",
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
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
