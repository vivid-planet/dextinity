import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigJson from "@dextinity/eslint-config/json.js";

export default defineConfig([
    globalIgnores(["schema.json", "src/fragmentTypes.json", "dist/**", "block-meta.json", "lang/**", "lang-compiled/**", "lang-extracted/**"]),
    ...eslintConfigJson,
]);
