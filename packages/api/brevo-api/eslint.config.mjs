import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigNestJs from "@dextinity/eslint-config/nestjs.js";

export default defineConfig([
    globalIgnores(["src/db/migrations/**", "dist/**", "src/**/*.generated.ts", "lib/**", "block-meta.json"]),
    ...eslintConfigNestJs,
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
            "package-json/require-exports": "off", // TODO reenable after migrating to ESM
        },
    },
]);
