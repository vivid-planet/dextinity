import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigNestJs from "@dextinity/eslint-config/future/nestjs.js";
import storybook from "eslint-plugin-storybook";

export default defineConfig([
    globalIgnores([
        "src/db/migrations/**",
        "dist/**",
        "src/**/*.generated.ts",
        "src/**/generated/**",
        "block-meta.json",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
    ]),
    ...eslintConfigNestJs,
    ...storybook.configs["flat/recommended"],
]);
