import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**"]),
    ...eslintConfigReact,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
]);
