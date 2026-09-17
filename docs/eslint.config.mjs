import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores([".docusaurus", "build"]),
    ...eslintConfigReact,
    {
        rules: {
            "react/jsx-no-literals": "off",
        },
    },
]);
