import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigNextJs from "@dextinity/eslint-config/future/nextjs.js";

const docsLink = "https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site";

export default defineConfig([
    globalIgnores([
        "**/**/*.generated.ts",
        "dist/**",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
        ".next/**",
        "public/**",
        "block-meta.json",
        "lang/**",
        "lang-compiled/**",
        "lang-extracted/**",
    ]),
    ...eslintConfigNextJs,
    {
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][property.name=/^NEXT_PUBLIC_/]",
                    message: `Usage of process.env.NEXT_PUBLIC_* is not allowed. Use site configs or a custom provider instead. See ${docsLink}`,
                },
            ],
        },
    },
    {
        files: ["next.config.*"],
        languageOptions: {
            parserOptions: {
                projectService: false,
                project: null,
                programs: null,
            },
        },
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env']",
                    message: `Usage of process.env in next.config is not allowed. Use site configs or runtime configuration instead. See ${docsLink}`,
                },
            ],
        },
    },
]);
