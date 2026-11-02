import reactConfig from "@dextinity/oxlint-config/react.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [reactConfig],
    plugins: reactConfig.plugins,
    ignorePatterns: ["dist/**", "src/**/*.generated.ts", "src/**/generated/**", "lang/**", "lang-compiled/**", "lang-extracted/**"],
});
