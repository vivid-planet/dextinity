import { defineConfig } from "eslint/config";
import eslintConfigCore from "@dextinity/eslint-config/core.js";

export default defineConfig([
    ...eslintConfigCore,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
            "package-json/require-exports": "off", // TODO reenable after migrating to ESM
        },
    },
]);
