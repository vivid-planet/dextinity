import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact, { restrictedImportPaths } from "@dextinity/eslint-config/future/react.js";
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import dextinityPlugin from "@dextinity/eslint-plugin";

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**"]),
    ...eslintConfigReact,
    {
        // `buildRestMutation.tsx` interpolates JS expressions into `gql` templates, which `@graphql-eslint/eslint-plugin` cannot parse.
        files: ["src/buildRestMutation.tsx"],
        processor: {
            meta: { name: "no-op" },
            preprocess: (code) => [code],
            postprocess: (messages) => messages.flat(),
            supportsAutofix: true,
        },
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@dextinity/no-other-module-relative-import": "off",
        },
    },
    {
        files: ["**/*.test.ts", "**/*.test.tsx"],
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        ...restrictedImportPaths,
                        {
                            name: "@testing-library/react",
                            message: 'Please import from "test-utils" instead.',
                        },
                    ],
                },
            ],
        },
    },
    {
        plugins: {
            "@dextinity": dextinityPlugin,
        },
        rules: {
            "@dextinity/no-private-sibling-import": ["error", ["gql", "sc", "styles", "generated"]],
        },
    },
    ...storybook.configs["flat/recommended"],
    {
        files: ["**/*.stories.ts", "**/*.stories.tsx"],
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-console": "off",
            "@dextinity/no-other-module-relative-import": "off",
            "react/react-in-jsx-scope": "off",
            "react/jsx-no-literals": "off",
        },
    },
]);
