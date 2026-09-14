import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores([".docusaurus", "build"]),
    ...eslintConfigReact,
    {
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "react/jsx-no-literals": "off",
        },
    },
]);
