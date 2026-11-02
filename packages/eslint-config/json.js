import { configs as eslintPluginJsonc } from "eslint-plugin-jsonc";
import packageJson from "eslint-plugin-package-json";

/** @type {import('eslint')} */
const config = [
    ...eslintPluginJsonc["flat/recommended-with-json"],
    {
        ignores: [
            /**
             * disable package.json and nested package.json files (e.g.in admin -> /server/package.json)
             */
            "**/package.json",
        ],
        rules: {
            "jsonc/sort-keys": "error",
        },
    },
    {
        ...packageJson.configs.recommended,
        rules: {
            ...packageJson.configs.recommended.rules,
            "package-json/require-type": "off",
            "package-json/require-description": "off",
            "package-json/require-attribution": "off",
        },
    },
];

export default config;
