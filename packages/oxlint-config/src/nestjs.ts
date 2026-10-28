import { defineConfig, type OxlintConfig } from "oxlint";

import coreConfig, { restrictedImportPatterns } from "./core.js";

export const restrictedImportPaths = [
    {
        name: "node-cache",
        message: "node-cache is abandonware. Use @nestjs/cache-manager instead",
    },
];

const config: OxlintConfig = defineConfig({
    extends: [coreConfig],
    plugins: ["eslint", "typescript", "import"],
    rules: {
        "import-js/no-extraneous-dependencies": [
            "error",
            {
                devDependencies: ["**/*.spec.ts", "**/*.test.ts"],
            },
        ],
        "no-console": "off",
        "typescript/consistent-type-imports": "off",
        "no-duplicate-imports": "error",
        "no-restricted-imports": [
            "error",
            {
                paths: restrictedImportPaths,
                patterns: restrictedImportPatterns,
            },
        ],
    },
});

export default config;
