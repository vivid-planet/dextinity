import reactConfig from "@dextinity/oxlint-config/react.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [reactConfig],
    plugins: reactConfig.plugins,
    ignorePatterns: ["dist/**", "storybook-static/**", "src/**/*.generated.ts", "lang/**", "lang-compiled/**", "lang-extracted/**"],
});
