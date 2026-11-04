import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/nestjs.js";

export default defineConfig([
    globalIgnores(["src/mikro-orm/migrations/**", "lib/**", "block-meta.json"]),
    ...eslintConfigReact,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
            "package-json/require-exports": "off", // TODO reenable after migrating to ESM
        },
    },
]);
