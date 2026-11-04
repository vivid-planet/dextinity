import coreConfig, { restrictedImportPatterns } from "./core.js";
import globals from "globals";

export const restrictedImportPaths = [
    {
        name: "node-cache",
        message: "node-cache is abandonware. Use @nestjs/cache-manager instead",
    },
];

/** @type {import('eslint')} */
const config = [
    ...coreConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "import/no-extraneous-dependencies": [
                "error",
                {
                    devDependencies: ["**/*.spec.ts", "**/*.test.ts"],
                },
            ],
            "import/order": "off",
            "no-console": "off",
            "no-duplicate-imports": "error",
            "sort-imports": "off",
            "no-restricted-imports": [
                "error",
                {
                    paths: restrictedImportPaths,
                    patterns: restrictedImportPatterns,
                },
            ],
        },
    },
];

export default config;
