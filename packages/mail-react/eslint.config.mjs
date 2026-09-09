import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores(["lib/**", "src/**/*.generated.ts", "block-meta.json"]),
    ...eslintConfigReact,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        files: ["src/**/*.stories.tsx", "src/**/*.test.ts", "src/**/*.test.tsx", "src/storybook/**"],
        rules: {
            "react/jsx-no-literals": "off",
        },
    },
    {
        files: ["src/storybook/**"],
        rules: {
            "no-restricted-imports": "off",
        },
    },
]);
