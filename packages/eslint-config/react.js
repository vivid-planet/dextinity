import coreConfig, { restrictedImportPatterns } from "./core.js";
import reactIntlFormatPlugin from "@calm/eslint-plugin-react-intl";
import globals from "globals";
import formatJs from "eslint-plugin-formatjs";
import graphqlPlugin from "@graphql-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import dextinityPlugin from "@dextinity/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

const dextinityAdminImportsRestrictedFromMuiMaterial = ["Alert", "Button", "Dialog", "Tooltip"];

export const restrictedImportPaths = [
    ...dextinityAdminImportsRestrictedFromMuiMaterial.map((name) => ({
        name: "@mui/material",
        importNames: [name],
        message: `Please use ${name} from @dextinity/admin instead`,
    })),
    ...dextinityAdminImportsRestrictedFromMuiMaterial.map((name) => ({
        name: `@mui/material/${name}`,
        message: `Please use ${name} from @dextinity/admin instead`,
    })),
    {
        name: "react",
        importNames: ["default"],
    },
    {
        name: "@mui/material",
        importNames: ["styled"],
        message: "Please use styled from @mui/material/styles instead.",
    },
    {
        name: "@mui/icons-material",
        message: "Please use @dextinity/admin-icons instead",
    },
    {
        name: "@mui/x-data-grid",
        importNames: ["GridColDef"],
        message: "Please use GridColDef from @dextinity/admin instead",
    },
    {
        name: "@mui/x-data-grid-pro",
        importNames: ["GridColDef"],
        message: "Please use GridColDef from @dextinity/admin instead",
    },
    {
        name: "@mui/x-data-grid-premium",
        importNames: ["GridColDef"],
        message: "Please use GridColDef from @dextinity/admin instead",
    },
    {
        name: "@mui/x-data-grid",
        importNames: ["GridToolbarQuickFilter"],
        message: "Please use GridToolbarQuickFilter from @dextinity/admin instead",
    },
    {
        name: "@mui/x-data-grid-pro",
        importNames: ["GridToolbarQuickFilter"],
        message: "Please use GridToolbarQuickFilter from @dextinity/admin instead",
    },
    {
        name: "@mui/x-data-grid-premium",
        importNames: ["GridToolbarQuickFilter"],
        message: "Please use GridToolbarQuickFilter from @dextinity/admin instead",
    },
];

/** @type {import('eslint')} */
const config = [
    ...coreConfig,
    {
        plugins: {
            "@calm/react-intl": reactIntlFormatPlugin,
        },
    },
    {
        plugins: {
            formatjs: formatJs,
        },
        rules: {
            "formatjs/enforce-default-message": ["error", "literal"],
            "formatjs/enforce-placeholders": "error",
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@calm/react-intl/missing-formatted-message": ["error", { enforceLabels: true }],
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        ignores: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
        rules: {
            "react/jsx-no-literals": [
                "error",
                {
                    allowedStrings: ["…", "€", "$", "?", "–", "—", "/", "(", ")", "%"],
                },
            ],
            "@typescript-eslint/consistent-type-exports": [
                "error",
                {
                    fixMixedExportsWithInlineTypeSpecifier: true,
                },
            ],
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
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
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "react/self-closing-comp": "error",
            "react/display-name": "off",
            "react/prop-types": "off",
            "react/jsx-curly-brace-presence": "error",
            "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
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
        plugins: {
            "@dextinity": dextinityPlugin,
        },
        rules: {
            "@dextinity/no-private-sibling-import": "error",
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
