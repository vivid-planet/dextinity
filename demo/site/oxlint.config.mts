import nextjsConfig from "@dextinity/oxlint-config/nextjs.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [nextjsConfig],
    plugins: nextjsConfig.plugins,
    ignorePatterns: ["**/*.generated.ts", "dist/**", ".next/**", "public/**", "lang/**", "lang-compiled/**", "lang-extracted/**"],
});
