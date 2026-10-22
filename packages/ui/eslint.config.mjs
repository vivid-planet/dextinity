import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";
import storybook from "eslint-plugin-storybook";

export default defineConfig([
    globalIgnores(["lib/**"]),
    ...eslintConfigReact,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    ...storybook.configs["flat/recommended"],
    {
        files: ["src/**/*.stories.tsx", "src/**/*.test.ts", "src/**/*.test.tsx"],
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "react/jsx-no-literals": "off",
        },
    },
]);
