import coreConfig, { restrictedImportPatterns } from "./core.js";
import graphqlPlugin from "@graphql-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";

export const restrictedImportPaths = [
    {
        name: "react",
        importNames: ["default"],
    },
    {
        name: "next/image",
        importNames: ["default"],
        message: "Don't use next/image. See https://cms-docs.dextinity.com/docs/faqs/next-image-import-restriction",
    },
    {
        name: "node-cache",
        message: "node-cache is abandonware. Use cache-manager or @cacheable/node-cache instead",
    },
];

/** @type {import('eslint')} */
const config = [
    ...coreConfig,
    // Extend config from plugin instead of using eslint-config-next to prevent issues with duplicate plugins, e.g., import.
    // See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config.
    nextPlugin.configs["core-web-vitals"],
    {
        rules: {
            "@dextinity/no-private-sibling-import": ["error", ["gql", "sc", "gql.generated"]],
            "no-restricted-globals": ["error", "React"],
            "no-restricted-imports": [
                "error",
                {
                    paths: restrictedImportPaths,
                    patterns: restrictedImportPatterns,
                },
            ],
        },
    },
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            react: react,
            "react-hooks": reactHooks,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/display-name": "off",
            "react/jsx-curly-brace-presence": "error",
            "react/prop-types": "off",
            "react/self-closing-comp": "error",
            "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
            "react/react-in-jsx-scope": "off",
            "@next/next/no-img-element": "off",
        },
    },
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        processor: graphqlPlugin.processor,
    },
    {
        files: ["**/*.graphql"],
        languageOptions: {
            parser: graphqlPlugin.parser,
        },
        plugins: {
            "@graphql-eslint": graphqlPlugin,
        },
        rules: {
            // Type-info rules from typescript-eslint cannot run on virtual GraphQL blocks extracted by the processor.
            "@typescript-eslint/consistent-type-imports": "off",
            "@typescript-eslint/consistent-type-exports": "off",
            "@graphql-eslint/naming-convention": [
                "error",
                {
                    OperationDefinition: {
                        forbiddenSuffixes: ["Query", "Mutation", "Subscription"],
                    },
                    FragmentDefinition: {
                        forbiddenSuffixes: ["Fragment"],
                    },
                },
            ],
        },
    },
];

export default config;
