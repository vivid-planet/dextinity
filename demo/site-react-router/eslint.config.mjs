import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

const docsLink = "https://cms-docs.dextinity.com/docs/faqs/environment-variables-in-site";

export default defineConfig([
    globalIgnores(["**/**/*.generated.ts", "lang/**", "lang-compiled/**", "lang-extracted/**", "build/**", ".react-router/**", "public/**", "block-meta.json"]),
    ...eslintConfigReact,
    {
        // Like the Next.js site, the demo has texts that aren't translated
        rules: {
            "react/jsx-no-literals": "off",
            "@calm/react-intl/missing-formatted-message": "off",
        },
    },
    {
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.property.name='env'][property.name=/^VITE_/]",
                    message: `Usage of import.meta.env.VITE_* is not allowed. Use site configs or a custom provider instead. See ${docsLink}`,
                },
            ],
        },
    },
]);
