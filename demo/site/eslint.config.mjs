import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigJson from "@dextinity/eslint-config/json.js";

export default defineConfig([
    globalIgnores(["dist/**", ".next/**", "public/**", "block-meta.json", "lang/**", "lang-compiled/**", "lang-extracted/**"]),
    ...eslintConfigJson,
]);
