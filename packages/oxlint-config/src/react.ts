import { defineConfig, type DummyRuleMap, type OxlintConfig } from "oxlint";

import coreConfig, { resolvePlugin, restrictedImportPatterns } from "./core.js";

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
    ...["@mui/x-data-grid", "@mui/x-data-grid-pro", "@mui/x-data-grid-premium"].flatMap((name) => [
        {
            name,
            importNames: ["GridColDef"],
            message: "Please use GridColDef from @dextinity/admin instead",
        },
        {
            name,
            importNames: ["GridToolbarQuickFilter"],
            message: "Please use GridToolbarQuickFilter from @dextinity/admin instead",
        },
    ]),
];

export const disabledReactCompilerRules: DummyRuleMap = {
    "react/error-boundaries": "off",
    "react/globals": "off",
    "react/immutability": "off",
    "react/incompatible-library": "off",
    "react/preserve-manual-memoization": "off",
    "react/purity": "off",
    "react/refs": "off",
    "react/set-state-in-effect": "off",
    "react/set-state-in-render": "off",
    "react/static-components": "off",
    "react/use-memo": "off",
    "react/void-use-memo": "off",
};

const config: OxlintConfig = defineConfig({
    extends: [coreConfig],
    plugins: ["eslint", "typescript", "import", "react"],
    jsPlugins: [{ name: "formatjs", specifier: resolvePlugin("eslint-plugin-formatjs") }],
    env: {
        browser: true,
    },
    settings: {
        react: {
            version: "19.0.0",
        },
    },
    rules: {
        ...disabledReactCompilerRules,
        "formatjs/enforce-default-message": ["error", "literal"],
        "formatjs/enforce-placeholders": "error",

        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "error",
        "react/self-closing-comp": "error",
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

        "@dextinity/no-private-sibling-import": "error",
    },
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            excludeFiles: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
            rules: {
                "react/jsx-no-literals": [
                    "error",
                    {
                        allowedStrings: ["…", "€", "$", "?", "–", "—", "/", "(", ")", "%"],
                    },
                ],
                "typescript/consistent-type-exports": [
                    "error",
                    {
                        fixMixedExportsWithInlineTypeSpecifier: true,
                    },
                ],
            },
        },
    ],
});

export default config;
