import nextjsConfig from "@dextinity/oxlint-config/nextjs.js";
import { defineConfig } from "oxlint";

export default defineConfig({
    extends: [nextjsConfig],
    plugins: nextjsConfig.plugins,
    ignorePatterns: ["**/*.generated.ts", ".next/**", "public/**", "storybook-static/**", "lang/**", "lang-compiled/**", "lang-extracted/**"],
    overrides: [
        {
            files: ["next.config.*"],
            rules: {
                "no-restricted-properties": [
                    "error",
                    {
                        object: "process",
                        property: "env",
                        message:
                            "Usage of process.env in next.config is not allowed. Use site configs or runtime configuration instead. See https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site",
                    },
                ],
            },
        },
    ],
});
