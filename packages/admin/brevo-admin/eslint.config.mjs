import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact, { restrictedImportPaths } from "@dextinity/eslint-config/future/react.js";

const dataGridImportRestrictions = ["@mui/x-data-grid", "@mui/x-data-grid-pro", "@mui/x-data-grid-premium"].flatMap((name) =>
    ["DataGrid", "DataGridPro", "DataGridPremium"].map((importName) => ({
        name,
        importNames: [importName],
        message: "Please use DataGrid from `@dextinity/brevo-admin` instead, which resolves the configured grid via `DextinityConfig`.",
    })),
);

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**", "**/*.generated.ts", "block-meta.json"]),
    ...eslintConfigReact,
    {
        // This file interpolates a JS expression into a `gql` template, which `@graphql-eslint/eslint-plugin` cannot parse.
        files: ["src/targetGroups/TargetGroupForm.tsx"],
        processor: {
            meta: { name: "no-op" },
            preprocess: (code) => [code],
            postprocess: (messages) => messages.flat(),
            supportsAutofix: true,
        },
    },
    {
        rules: {
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [...restrictedImportPaths, ...dataGridImportRestrictions],
                },
            ],
        },
    },
]);
