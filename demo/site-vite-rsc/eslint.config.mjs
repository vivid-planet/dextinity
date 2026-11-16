import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";
import storybook from "eslint-plugin-storybook";

const docsLink = "https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site";

export default defineConfig([
    globalIgnores([
        "**/**/*.generated.ts",
        "dist/**",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
        "public/**",
        "storybook-static/**",
        "block-meta.json",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
    ]),
    ...eslintConfigReact,
    ...storybook.configs["flat/recommended"],
    {
        rules: {
            // Not all texts of the demo site are translated yet
            "@calm/react-intl/missing-formatted-message": "off",
            "react/jsx-no-literals": "off",
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.property.name='env'][property.name=/^VITE_/]",
                    message: `Usage of import.meta.env.VITE_* is not allowed. Use site configs or a custom provider instead. See ${docsLink}`,
                },
            ],
        },
    },
    {
        // The storybook config files live outside tsconfig.json's `include`, in their own project.
        files: [".storybook/**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                projectService: false,
                project: ["./tsconfig.storybook.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
]);
