import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigReact from "@dextinity/eslint-config/future/react.js";
import storybook from "eslint-plugin-storybook";

export default defineConfig([
    globalIgnores(["src/*.generated.ts", "lib/**", "storybook-static/**"]),
    ...eslintConfigReact,
    ...storybook.configs["flat/recommended"],
    {
        rules: {
            "@calm/react-intl/missing-formatted-message": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-console": "off",
            "@dextinity/no-other-module-relative-import": "off",
            "react/react-in-jsx-scope": "off",
            "react/jsx-no-literals": "off",
            // The dependencies can only list the package `@dextinity/mail-react`, while the rule looks for the addon name with the `/storybook` subpath.
            "storybook/no-uninstalled-addons": ["error", { ignore: ["@dextinity/mail-react/storybook"] }],
        },
    },
]);
