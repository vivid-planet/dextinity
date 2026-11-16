import { defineConfig, type OxlintConfig } from "oxlint";

import coreConfig, { restrictedImportPatterns } from "./core.js";
import { disabledReactCompilerRules } from "./react.js";

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

const config: OxlintConfig = defineConfig({
    extends: [coreConfig],
    plugins: ["eslint", "typescript", "import", "react", "nextjs"],
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
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "error",
        "react/jsx-key": "error",
        "react/no-children-prop": "error",
        "react/no-danger-with-children": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-find-dom-node": "error",
        "react/no-is-mounted": "error",
        "react/no-render-return-value": "error",
        "react/no-string-refs": "error",
        "react/no-unescaped-entities": "error",
        "react/no-unknown-property": "error",
        "react/jsx-no-comment-textnodes": "error",
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-target-blank": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-curly-brace-presence": "error",
        "react/self-closing-comp": "error",
        "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
        "nextjs/no-img-element": "off",

        "@dextinity/no-private-sibling-import": ["error", ["gql", "sc", "gql.generated"]],
        "@dextinity/no-next-public-env": "error",
        "no-restricted-globals": ["error", "React"],
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
