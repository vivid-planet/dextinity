import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores(["lib/**"]),
    ...eslintConfigReact,
    {
        rules: {
            // Rewrites imports to the @src/ alias, which tsc doesn't resolve in the ESM output
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
]);
